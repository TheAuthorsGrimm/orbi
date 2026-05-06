import { Request, Response } from "express";
import { FocusSession } from "../models/FocusSession";

export async function listSessions(req: Request, res: Response): Promise<void> {
  const sessions = await FocusSession.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data: sessions });
}

export async function createSession(req: Request, res: Response): Promise<void> {
  const session = await FocusSession.create({ ...req.body, userId: req.userId });
  res.status(201).json({ success: true, data: session });
}

export async function updateSession(req: Request, res: Response): Promise<void> {
  const session = await FocusSession.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  if (!session) { res.status(404).json({ success: false, error: "Session not found" }); return; }
  res.json({ success: true, data: session });
}

export async function getStats(req: Request, res: Response): Promise<void> {
  const sessions = await FocusSession.find({ userId: req.userId, completedAt: { $exists: true } });
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const avgEnergy = sessions.filter(s => s.energyLevel).reduce((sum, s) => sum + (s.energyLevel || 0), 0) / (sessions.length || 1);
  res.json({ success: true, data: { totalSessions: sessions.length, totalMinutes, avgEnergy: Math.round(avgEnergy * 10) / 10 } });
}
