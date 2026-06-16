import { NextRequest, NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { chatMessages, chatSessions } from "@/lib/db/schema";
import { requireUser, AuthError } from "@/lib/auth/session";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-5";

const schema = z.object({
  content: z.string().min(1).max(8000),
  sessionId: z.string().uuid().optional(),
});

function systemPrompt(displayName: string, tier: string): string {
  const base = `You are Orbi, an AI companion designed for people with ADHD. You're part of the Orbi app by GrimmForged.

CORE PRINCIPLES:
- Break overwhelming tasks into tiny micro-steps (max 15 minutes each)
- Acknowledge difficulty without dismissing it
- Keep responses SHORT and scannable — walls of text are kryptonite for ADHD brains
- Use bullet points and clear formatting
- Never shame, never nag — redirect with curiosity
- Always end task-related responses with one clear next action

USER: ${displayName} (plan: ${tier})`;
  return tier === "free"
    ? `${base}\n\nNOTE: Free plan — keep replies concise; mention the Agent/Full plan only if the user asks about premium features.`
    : base;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = schema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    let sessionId = parsed.data.sessionId;
    if (!sessionId) {
      const [s] = await db.insert(chatSessions).values({ userId: user.id }).returning({ id: chatSessions.id });
      sessionId = s.id;
    } else {
      const [exists] = await db
        .select({ id: chatSessions.id })
        .from(chatSessions)
        .where(eq(chatSessions.id, sessionId))
        .limit(1);
      if (!exists) {
        return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
      }
    }

    await db.insert(chatMessages).values({
      sessionId,
      userId: user.id,
      role: "user",
      content: parsed.data.content,
    });

    const history = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(40);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "AI is not configured yet (ANTHROPIC_API_KEY missing)" },
        { status: 503 },
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const completion = await anthropic.messages.create({
      model: MODEL,
      max_tokens: user.tier === "free" ? 300 : 1024,
      system: systemPrompt(user.displayName, user.tier),
      messages: history.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    });

    const block = completion.content[0];
    const reply = block.type === "text" ? block.text : "";

    const [assistantMessage] = await db
      .insert(chatMessages)
      .values({ sessionId, userId: user.id, role: "assistant", content: reply })
      .returning();

    await db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, sessionId));

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        message: { ...assistantMessage, _id: assistantMessage.id },
      },
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    throw err;
  }
}
