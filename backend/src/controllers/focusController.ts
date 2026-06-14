import { Request, Response } from "express";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { getDb } from "../db/client";
import { focusSessions } from "../db/schema";
import { withMongoId, withMongoIdMany } from "../db/serialize";

export async function listSessions(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const sessions = await db
    .select()
    .from(focusSessions)
    .where(eq(focusSessions.userId, req.userId))
    .orderBy(desc(focusSessions.createdAt))
    .limit(50);
  res.json({ success: true, data: withMongoIdMany(sessions) });
}

export async function createSession(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const body = req.body ?? {};
  const [session] = await db
    .insert(focusSessions)
    .values({
      userId: req.userId,
      taskId: body.taskId ?? null,
      durationMinutes: body.durationMinutes,
      interruptionCount: body.interruptionCount ?? 0,
      energyLevel: body.energyLevel ?? null,
      notes: body.notes ?? null,
      completedAt: body.completedAt ? new Date(body.completedAt) : null,
    })
    .returning();
  res.status(201).json({ success: true, data: withMongoId(session) });
}

export async function updateSession(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const update: Record<string, unknown> = { ...req.body };
  if (update.completedAt) update.completedAt = new Date(update.completedAt as string);

  const [session] = await db
    .update(focusSessions)
    .set(update)
    .where(and(eq(focusSessions.id, req.params.id), eq(focusSessions.userId, req.userId)))
    .returning();
  if (!session) {
    res.status(404).json({ success: false, error: "Session not found" });
    return;
  }
  res.json({ success: true, data: withMongoId(session) });
}

export async function getStats(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const sessions = await db
    .select()
    .from(focusSessions)
    .where(and(eq(focusSessions.userId, req.userId), isNotNull(focusSessions.completedAt)));

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const withEnergy = sessions.filter((s) => s.energyLevel != null);
  const avgEnergy = withEnergy.length
    ? withEnergy.reduce((sum, s) => sum + (s.energyLevel as number), 0) / withEnergy.length
    : 0;

  res.json({
    success: true,
    data: {
      totalSessions: sessions.length,
      totalMinutes,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
    },
  });
}
