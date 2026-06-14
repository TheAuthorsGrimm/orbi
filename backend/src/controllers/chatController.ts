import { Request, Response } from "express";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { OrbiTier } from "@orbi/types";
import { getDb } from "../db/client";
import { chatMessages, chatSessions, users } from "../db/schema";
import { withMongoId, withMongoIdMany } from "../db/serialize";
import { getAgentResponse, streamAgentResponse } from "../services/orbiAgent";

export async function listSessions(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const sessions = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.userId, req.userId))
    .orderBy(desc(chatSessions.updatedAt))
    .limit(50);
  res.json({ success: true, data: withMongoIdMany(sessions) });
}

export async function createSession(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const [session] = await db
    .insert(chatSessions)
    .values({ userId: req.userId, title: req.body?.title || "New conversation" })
    .returning();
  res.status(201).json({ success: true, data: withMongoId(session) });
}

export async function getSession(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const [session] = await db
    .select()
    .from(chatSessions)
    .where(and(eq(chatSessions.id, req.params.id), eq(chatSessions.userId, req.userId)))
    .limit(1);
  if (!session) {
    res.status(404).json({ success: false, error: "Session not found" });
    return;
  }
  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, session.id))
    .orderBy(asc(chatMessages.createdAt));
  res.json({
    success: true,
    data: { session: withMongoId(session), messages: withMongoIdMany(messages) },
  });
}

export async function deleteSession(req: Request, res: Response): Promise<void> {
  const db = getDb();
  await db
    .delete(chatSessions)
    .where(and(eq(chatSessions.id, req.params.id), eq(chatSessions.userId, req.userId)));
  res.json({ success: true, message: "Session deleted" });
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const { content, stream } = req.body;
  if (!content) {
    res.status(400).json({ success: false, error: "content required" });
    return;
  }
  const db = getDb();

  const [session] = await db
    .select()
    .from(chatSessions)
    .where(and(eq(chatSessions.id, req.params.id), eq(chatSessions.userId, req.userId)))
    .limit(1);
  if (!session) {
    res.status(404).json({ success: false, error: "Session not found" });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.id, req.userId)).limit(1);
  if (!user) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }

  await db.insert(chatMessages).values({
    sessionId: session.id,
    userId: req.userId,
    role: "user",
    content,
  });

  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, session.id))
    .orderBy(asc(chatMessages.createdAt))
    .limit(40);

  async function finalize(assistantText: string): Promise<void> {
    await db.insert(chatMessages).values({
      sessionId: session.id,
      userId: req.userId,
      role: "assistant",
      content: assistantText,
    });
    await db
      .update(chatSessions)
      .set({ messageCount: sql`${chatSessions.messageCount} + 2`, updatedAt: new Date() })
      .where(eq(chatSessions.id, session.id));
  }

  if (stream && req.userTier !== OrbiTier.FREE) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";
    for await (const chunk of streamAgentResponse({ user, messages: history })) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }
    await finalize(fullResponse);
    res.write("data: [DONE]\n\n");
    res.end();
  } else {
    const reply = await getAgentResponse({ user, messages: history });
    await finalize(reply);
    res.json({ success: true, data: { reply } });
  }
}
