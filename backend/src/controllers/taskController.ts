import { Request, Response } from "express";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { OrbiTier, TaskStatus } from "@orbi/types";
import { getDb } from "../db/client";
import { tasks, users } from "../db/schema";
import { withMongoId, withMongoIdMany } from "../db/serialize";
import { decomposeTask } from "../services/orbiAgent";

const FREE_TASK_LIMIT = 5;

export async function listTasks(req: Request, res: Response): Promise<void> {
  const { status, priority, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Number(page) || 1;
  const limitNum = Math.min(Number(limit) || 20, 100);
  const db = getDb();

  const filters = [eq(tasks.userId, req.userId)];
  if (status) filters.push(eq(tasks.status, status));
  if (priority) filters.push(eq(tasks.priority, priority));
  const where = and(...filters);

  const rows = await db
    .select()
    .from(tasks)
    .where(where)
    .orderBy(desc(tasks.priority), desc(tasks.createdAt))
    .limit(limitNum)
    .offset((pageNum - 1) * limitNum);

  const [{ value: total }] = await db.select({ value: count() }).from(tasks).where(where);

  res.json({
    success: true,
    data: withMongoIdMany(rows),
    total,
    page: pageNum,
    limit: limitNum,
    hasMore: total > pageNum * limitNum,
  });
}

export async function getTask(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, req.params.id), eq(tasks.userId, req.userId)))
    .limit(1);
  if (!task) {
    res.status(404).json({ success: false, error: "Task not found" });
    return;
  }
  res.json({ success: true, data: withMongoId(task) });
}

export async function createTask(req: Request, res: Response): Promise<void> {
  const db = getDb();
  if (req.userTier === OrbiTier.FREE) {
    const [{ value: activeCount }] = await db
      .select({ value: count() })
      .from(tasks)
      .where(and(
        eq(tasks.userId, req.userId),
        inArray(tasks.status, [TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
      ));
    if (activeCount >= FREE_TASK_LIMIT) {
      res.status(403).json({
        success: false,
        error: `Free plan is limited to ${FREE_TASK_LIMIT} active tasks. Upgrade to Orbi Agent for unlimited tasks.`,
      });
      return;
    }
  }

  const body = req.body ?? {};
  const [task] = await db
    .insert(tasks)
    .values({
      userId: req.userId,
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      estimatedMinutes: body.estimatedMinutes,
      steps: body.steps ?? [],
      tags: body.tags ?? [],
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      aiGenerated: body.aiGenerated ?? false,
    })
    .returning();
  res.status(201).json({ success: true, data: withMongoId(task) });
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const update: Record<string, unknown> = { ...req.body, updatedAt: new Date() };
  if (update.status === TaskStatus.COMPLETE && !update.completedAt) {
    update.completedAt = new Date();
  }
  if (update.dueDate) update.dueDate = new Date(update.dueDate as string);

  const [task] = await db
    .update(tasks)
    .set(update)
    .where(and(eq(tasks.id, req.params.id), eq(tasks.userId, req.userId)))
    .returning();
  if (!task) {
    res.status(404).json({ success: false, error: "Task not found" });
    return;
  }
  res.json({ success: true, data: withMongoId(task) });
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const [deleted] = await db
    .delete(tasks)
    .where(and(eq(tasks.id, req.params.id), eq(tasks.userId, req.userId)))
    .returning({ id: tasks.id });
  if (!deleted) {
    res.status(404).json({ success: false, error: "Task not found" });
    return;
  }
  res.json({ success: true, message: "Task deleted" });
}

export async function decomposeTaskHandler(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, req.params.id), eq(tasks.userId, req.userId)))
    .limit(1);
  if (!task) {
    res.status(404).json({ success: false, error: "Task not found" });
    return;
  }
  const [user] = await db.select().from(users).where(eq(users.id, req.userId)).limit(1);
  if (!user) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }

  const rawSteps = await decomposeTask(task.title, task.description ?? undefined, user);
  const steps = rawSteps.map((s) => ({ id: uuid(), ...s, completed: false }));
  const [updated] = await db
    .update(tasks)
    .set({ steps, aiGenerated: true, updatedAt: new Date() })
    .where(eq(tasks.id, task.id))
    .returning();
  res.json({ success: true, data: withMongoId(updated) });
}

export async function updateStep(req: Request, res: Response): Promise<void> {
  const { id, stepId } = req.params;
  const db = getDb();
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, req.userId)))
    .limit(1);
  if (!task) {
    res.status(404).json({ success: false, error: "Task not found" });
    return;
  }
  const stepIndex = task.steps.findIndex((s) => s.id === stepId);
  if (stepIndex < 0) {
    res.status(404).json({ success: false, error: "Step not found" });
    return;
  }
  const newSteps = task.steps.slice();
  newSteps[stepIndex] = { ...newSteps[stepIndex], ...req.body };
  const [updated] = await db
    .update(tasks)
    .set({ steps: newSteps, updatedAt: new Date() })
    .where(eq(tasks.id, task.id))
    .returning();
  res.json({ success: true, data: withMongoId(updated) });
}
