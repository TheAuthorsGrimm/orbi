import {
  pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, pgEnum, index,
} from "drizzle-orm/pg-core";
import { OrbiTier, TaskStatus, TaskPriority } from "@orbi/types";

// -----------------------------------------------------------
// Enums
// -----------------------------------------------------------
export const tierEnum = pgEnum("orbi_tier", Object.values(OrbiTier) as [string, ...string[]]);
export const taskStatusEnum = pgEnum("task_status", Object.values(TaskStatus) as [string, ...string[]]);
export const taskPriorityEnum = pgEnum("task_priority", Object.values(TaskPriority) as [string, ...string[]]);
export const chatRoleEnum = pgEnum("chat_role", ["user", "assistant", "system"]);
export const reminderTriggerEnum = pgEnum("reminder_trigger", ["time", "location", "context", "ai"]);

// -----------------------------------------------------------
// Tables
// -----------------------------------------------------------
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    avatarUrl: text("avatar_url"),
    tier: tierEnum("tier").notNull().default(OrbiTier.FREE),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    googleAccessToken: text("google_access_token"),
    googleRefreshToken: text("google_refresh_token"),
    persona: jsonb("persona").$type<{
      name: string;
      tone: "gentle" | "energetic" | "focused" | "playful";
      motivationStyle: "encouragement" | "challenge" | "neutral";
      checkInFrequency: "low" | "medium" | "high";
      customTraits: string[];
    } | null>(),
    preferences: jsonb("preferences").$type<{
      theme: "dark" | "light" | "system";
      accentColor: string;
      notificationsEnabled: boolean;
      focusSessionDuration: number;
      breakDuration: number;
      timezone: string;
    }>().notNull().default({
      theme: "system",
      accentColor: "#7c6aff",
      notificationsEnabled: true,
      focusSessionDuration: 25,
      breakDuration: 5,
      timezone: "America/Halifax",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: index("users_email_idx").on(t.email),
    stripeIdx: index("users_stripe_customer_idx").on(t.stripeCustomerId),
  }),
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatusEnum("status").notNull().default(TaskStatus.PENDING),
    priority: taskPriorityEnum("priority").notNull().default(TaskPriority.MEDIUM),
    estimatedMinutes: integer("estimated_minutes"),
    steps: jsonb("steps").$type<{
      id: string;
      label: string;
      completed: boolean;
      estimatedMinutes?: number;
    }[]>().notNull().default([]),
    tags: text("tags").array().notNull().default([]),
    dueDate: timestamp("due_date", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    aiGenerated: boolean("ai_generated").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userStatusIdx: index("tasks_user_status_idx").on(t.userId, t.status),
    userDueIdx: index("tasks_user_due_idx").on(t.userId, t.dueDate),
  }),
);

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("New conversation"),
    summary: text("summary"),
    messageCount: integer("message_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("chat_sessions_user_idx").on(t.userId),
  }),
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: chatRoleEnum("role").notNull(),
    content: text("content").notNull(),
    toolUse: jsonb("tool_use").$type<{ name: string; input: Record<string, unknown>; result?: unknown }[] | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    sessionIdx: index("chat_messages_session_idx").on(t.sessionId, t.createdAt),
  }),
);

export const focusSessions = pgTable(
  "focus_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    taskId: uuid("task_id").references(() => tasks.id, { onDelete: "set null" }),
    durationMinutes: integer("duration_minutes").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    interruptionCount: integer("interruption_count").notNull().default(0),
    energyLevel: integer("energy_level"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("focus_sessions_user_idx").on(t.userId, t.createdAt),
  }),
);

export const reminders = pgTable(
  "reminders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    taskId: uuid("task_id").references(() => tasks.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    triggerType: reminderTriggerEnum("trigger_type").notNull(),
    triggerAt: timestamp("trigger_at", { withTimezone: true }),
    recurrence: text("recurrence"),
    sent: boolean("sent").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userTriggerIdx: index("reminders_user_trigger_idx").on(t.userId, t.triggerAt, t.sent),
  }),
);

// -----------------------------------------------------------
// Inferred row types
// -----------------------------------------------------------
export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;
export type ChatSessionRow = typeof chatSessions.$inferSelect;
export type ChatMessageRow = typeof chatMessages.$inferSelect;
export type FocusSessionRow = typeof focusSessions.$inferSelect;
export type ReminderRow = typeof reminders.$inferSelect;
