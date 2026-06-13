// =============================================================
// Orbi AI Agent Service
// Claude-powered ADHD companion with persona & tier support
// =============================================================

import Anthropic from "@anthropic-ai/sdk";
import { OrbiTier } from "@orbi/types";
import type { UserRow, ChatMessageRow } from "../db/schema";

type IUser = UserRow;
type IChatMessage = Pick<ChatMessageRow, "role" | "content">;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-sonnet-4-20250514";

// -----------------------------------------------------------
// System Prompt Builder
// -----------------------------------------------------------
function buildSystemPrompt(user: IUser): string {
  const persona = user.persona;
  const name = persona?.name || "Orbi";
  const tone = persona?.tone || "gentle";
  const motivationStyle = persona?.motivationStyle || "encouragement";
  const checkInFreq = persona?.checkInFrequency || "medium";
  const customTraits = persona?.customTraits?.join(", ") || "";

  const toneInstructions: Record<string, string> = {
    gentle:    "Speak softly and warmly. Be patient. Never rush or overwhelm.",
    energetic: "Be upbeat and enthusiastic! Use energy to motivate without overwhelming.",
    focused:   "Be concise and direct. Less small talk, more actionable steps.",
    playful:   "Add warmth and light humour. Make things feel fun and rewarding.",
  };

  const motivationInstructions: Record<string, string> = {
    encouragement: "Celebrate every step, no matter how small. Progress is progress.",
    challenge:     "Gently push the user to stretch a little further than comfortable.",
    neutral:       "Stay matter-of-fact and supportive without heavy emotional framing.",
  };

  return `You are ${name}, an AI companion designed specifically for people with ADHD.
You are part of the Orbi app by GrimmForged.

TONE: ${toneInstructions[tone]}
MOTIVATION: ${motivationInstructions[motivationStyle]}
${customTraits ? `ADDITIONAL TRAITS: ${customTraits}` : ""}

CORE ADHD PRINCIPLES you always follow:
- Break overwhelming tasks into tiny, specific micro-steps (never more than 15 minutes each)
- Acknowledge difficulty without dismissing it — ADHD is real, not laziness
- Reward progress, not perfection
- Keep responses SHORT and scannable — walls of text are kryptonite for ADHD brains
- Use bullet points and clear formatting when giving instructions
- Never shame, never nag — redirect with curiosity
- If the user seems stuck or anxious, offer one specific tiny action to start

CHECK-IN FREQUENCY: ${checkInFreq} — ${
    checkInFreq === "high"   ? "Check in proactively every few exchanges" :
    checkInFreq === "medium" ? "Check in occasionally when a task is in progress" :
                               "Only check in when the user asks or seems stuck"
  }

USER CONTEXT:
- Name: ${user.displayName}
- Plan: ${user.tier}
- Timezone: ${user.preferences?.timezone || "America/Halifax"}

${user.tier === OrbiTier.FREE ? 
  "NOTE: This user is on the Free plan. You can have brief helpful conversations but remind them gently that the full AI companion experience is available with Orbi Agent or Full plan." : 
  ""}

Always end task-related responses with a clear, single next action the user can take right now.`;
}

// -----------------------------------------------------------
// Chat Completion
// -----------------------------------------------------------
export interface ChatCompletionOptions {
  user: IUser;
  messages: IChatMessage[];
  stream?: boolean;
}

export async function getAgentResponse(
  options: ChatCompletionOptions
): Promise<string> {
  const { user, messages } = options;

  // Tier gate: Free users get limited responses
  const maxTokens = user.tier === OrbiTier.FREE ? 300 : 1024;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: buildSystemPrompt(user),
    messages: messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  });

  const block = response.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return block.text;
}

// -----------------------------------------------------------
// Streaming Chat Completion (Agent + Full tiers)
// -----------------------------------------------------------
export async function* streamAgentResponse(
  options: ChatCompletionOptions
): AsyncGenerator<string> {
  const { user, messages } = options;

  if (user.tier === OrbiTier.FREE) {
    throw new Error("Streaming requires Orbi Agent or Full plan");
  }

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: buildSystemPrompt(user),
    messages: messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

// -----------------------------------------------------------
// Task Decomposition
// -----------------------------------------------------------
export async function decomposeTask(
  taskTitle: string,
  taskDescription: string | undefined,
  user: IUser
): Promise<{ label: string; estimatedMinutes: number }[]> {
  const prompt = `Break down this task into micro-steps for someone with ADHD.
Task: "${taskTitle}"
${taskDescription ? `Details: ${taskDescription}` : ""}

Rules:
- Maximum 6 steps
- Each step must take 5-20 minutes maximum
- Steps must be extremely specific and actionable
- No vague steps like "research" or "work on it"

Respond ONLY with a JSON array like:
[{"label": "Open the file and read the first paragraph only", "estimatedMinutes": 5}]`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");

  const clean = block.text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// -----------------------------------------------------------
// Proactive Check-in Message Generator
// -----------------------------------------------------------
export async function generateCheckIn(
  user: IUser,
  context: { activeTask?: string; lastCheckIn?: Date; energyLevel?: number }
): Promise<string> {
  const prompt = `Generate a brief, friendly check-in message for ${user.displayName}.
${context.activeTask ? `They're working on: "${context.activeTask}"` : "They haven't started a task yet today."}
${context.energyLevel ? `Their energy level: ${context.energyLevel}/5` : ""}
${context.lastCheckIn ? `Last check-in was: ${context.lastCheckIn.toISOString()}` : ""}

Persona tone: ${user.persona?.tone || "gentle"}
Keep it to 1-2 sentences max. Be warm, not pushy.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 100,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");
  return block.text;
}
