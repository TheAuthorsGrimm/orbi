// =============================================================
// @orbi/types — Shared Domain Types
// GrimmForged — Orbi ADHD Productivity Companion
// =============================================================

// -----------------------------------------------------------
// SUBSCRIPTION TIERS
// -----------------------------------------------------------
export enum OrbiTier {
  FREE = "free",            // Planner + Calendar only
  AGENT = "agent",          // + AI Agent Orbi (monthly)
  FULL = "full",            // + Reminders + Tailored Persona
}

export const TIER_PRICING_CAD = {
  [OrbiTier.FREE]: 0,
  [OrbiTier.AGENT]: 9.99,
  [OrbiTier.FULL]: 24.99,
} as const;

export const TIER_FEATURES: Record<OrbiTier, string[]> = {
  [OrbiTier.FREE]: [
    "Task Planner",
    "Calendar View",
    "Basic task breakdown",
    "Up to 5 active tasks",
  ],
  [OrbiTier.AGENT]: [
    "Everything in Free",
    "AI Agent Orbi (Claude-powered)",
    "Proactive check-ins",
    "Task decomposition AI",
    "Focus session guidance",
    "Unlimited tasks",
  ],
  [OrbiTier.FULL]: [
    "Everything in Agent",
    "Smart Reminders (context-aware)",
    "Tailored Orbi Persona",
    "Hyperfocus protection mode",
    "Google Calendar sync",
    "Gmail integration",
    "Mood & energy tracking",
    "Weekly ADHD-aware insights",
  ],
};

// -----------------------------------------------------------
// USER
// -----------------------------------------------------------
export interface OrbiUser {
  _id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  tier: OrbiTier;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
  persona?: OrbiPersona;           // Full tier only
  preferences: UserPreferences;
}

export interface OrbiPersona {
  name: string;                    // User-chosen Orbi name
  tone: "gentle" | "energetic" | "focused" | "playful";
  motivationStyle: "encouragement" | "challenge" | "neutral";
  checkInFrequency: "low" | "medium" | "high";
  customTraits: string[];          // User-defined personality notes
}

export interface UserPreferences {
  theme: "dark" | "light" | "system";
  accentColor: string;
  notificationsEnabled: boolean;
  focusSessionDuration: number;    // minutes
  breakDuration: number;           // minutes
  timezone: string;
}

// -----------------------------------------------------------
// TASKS
// -----------------------------------------------------------
export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETE = "complete",
  DEFERRED = "deferred",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface OrbiTask {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedMinutes?: number;
  steps: TaskStep[];               // AI-decomposed micro-steps
  tags: string[];
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  aiGenerated: boolean;
}

export interface TaskStep {
  id: string;
  label: string;
  completed: boolean;
  estimatedMinutes?: number;
}

// -----------------------------------------------------------
// AI CHAT / AGENT
// -----------------------------------------------------------
export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  _id: string;
  sessionId: string;
  userId: string;
  role: MessageRole;
  content: string;
  toolUse?: ToolUseBlock[];
  createdAt: Date;
}

export interface ToolUseBlock {
  name: string;
  input: Record<string, unknown>;
  result?: unknown;
}

export interface ChatSession {
  _id: string;
  userId: string;
  title: string;
  summary?: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// -----------------------------------------------------------
// FOCUS SESSIONS
// -----------------------------------------------------------
export interface FocusSession {
  _id: string;
  userId: string;
  taskId?: string;
  durationMinutes: number;
  completedAt?: Date;
  interruptionCount: number;
  energyLevel?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt: Date;
}

// -----------------------------------------------------------
// REMINDERS (Full tier)
// -----------------------------------------------------------
export type ReminderTrigger = "time" | "location" | "context" | "ai";

export interface Reminder {
  _id: string;
  userId: string;
  taskId?: string;
  title: string;
  triggerType: ReminderTrigger;
  triggerAt?: Date;
  recurrence?: string;             // cron expression
  sent: boolean;
  createdAt: Date;
}

// -----------------------------------------------------------
// CALENDAR INTEGRATION
// -----------------------------------------------------------
export interface CalendarEvent {
  id: string;
  source: "google" | "orbi";
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  linkedTaskId?: string;
}

// -----------------------------------------------------------
// API RESPONSES
// -----------------------------------------------------------
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
