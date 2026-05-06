import { Request, Response } from "express";
import { ChatSession, ChatMessage } from "../models/Chat";
import { User } from "../models/User";
import { OrbiTier } from "@orbi/types";
import { getAgentResponse, streamAgentResponse } from "../services/orbiAgent";

export async function listSessions(req: Request, res: Response): Promise<void> {
  const sessions = await ChatSession.find({ userId: req.userId })
    .sort({ updatedAt: -1 })
    .limit(50);
  res.json({ success: true, data: sessions });
}

export async function createSession(req: Request, res: Response): Promise<void> {
  const session = await ChatSession.create({ userId: req.userId, title: req.body.title || "New conversation" });
  res.status(201).json({ success: true, data: session });
}

export async function getSession(req: Request, res: Response): Promise<void> {
  const session = await ChatSession.findOne({ _id: req.params.id, userId: req.userId });
  if (!session) { res.status(404).json({ success: false, error: "Session not found" }); return; }
  const messages = await ChatMessage.find({ sessionId: session._id }).sort({ createdAt: 1 });
  res.json({ success: true, data: { session, messages } });
}

export async function deleteSession(req: Request, res: Response): Promise<void> {
  await ChatSession.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  await ChatMessage.deleteMany({ sessionId: req.params.id });
  res.json({ success: true, message: "Session deleted" });
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const { content, stream } = req.body;
  if (!content) { res.status(400).json({ success: false, error: "content required" }); return; }

  const session = await ChatSession.findOne({ _id: req.params.id, userId: req.userId });
  if (!session) { res.status(404).json({ success: false, error: "Session not found" }); return; }

  const user = await User.findById(req.userId);
  if (!user) { res.status(404).json({ success: false, error: "User not found" }); return; }

  // Save user message
  await ChatMessage.create({ sessionId: session._id, userId: req.userId, role: "user", content });
  session.messageCount += 1;

  const history = await ChatMessage.find({ sessionId: session._id }).sort({ createdAt: 1 }).limit(40);

  if (stream && req.userTier !== OrbiTier.FREE) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";
    for await (const chunk of streamAgentResponse({ user, messages: history })) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }
    await ChatMessage.create({ sessionId: session._id, userId: req.userId, role: "assistant", content: fullResponse });
    session.messageCount += 1;
    await session.save();
    res.write("data: [DONE]\n\n");
    res.end();
  } else {
    const reply = await getAgentResponse({ user, messages: history });
    await ChatMessage.create({ sessionId: session._id, userId: req.userId, role: "assistant", content: reply });
    session.messageCount += 1;
    await session.save();
    res.json({ success: true, data: { reply } });
  }
}
