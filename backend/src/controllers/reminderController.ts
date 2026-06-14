import { Request, Response } from "express";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { reminders } from "../db/schema";
import { withMongoId, withMongoIdMany } from "../db/serialize";

export async function listReminders(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const rows = await db
    .select()
    .from(reminders)
    .where(eq(reminders.userId, req.userId))
    .orderBy(asc(reminders.triggerAt));
  res.json({ success: true, data: withMongoIdMany(rows) });
}

export async function createReminder(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const body = req.body ?? {};
  const [row] = await db
    .insert(reminders)
    .values({
      userId: req.userId,
      taskId: body.taskId ?? null,
      title: body.title,
      triggerType: body.triggerType,
      triggerAt: body.triggerAt ? new Date(body.triggerAt) : null,
      recurrence: body.recurrence ?? null,
    })
    .returning();
  res.status(201).json({ success: true, data: withMongoId(row) });
}

export async function updateReminder(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const update: Record<string, unknown> = { ...req.body };
  if (update.triggerAt) update.triggerAt = new Date(update.triggerAt as string);
  const [row] = await db
    .update(reminders)
    .set(update)
    .where(and(eq(reminders.id, req.params.id), eq(reminders.userId, req.userId)))
    .returning();
  if (!row) {
    res.status(404).json({ success: false, error: "Reminder not found" });
    return;
  }
  res.json({ success: true, data: withMongoId(row) });
}

export async function deleteReminder(req: Request, res: Response): Promise<void> {
  const db = getDb();
  await db
    .delete(reminders)
    .where(and(eq(reminders.id, req.params.id), eq(reminders.userId, req.userId)));
  res.json({ success: true, message: "Reminder deleted" });
}
