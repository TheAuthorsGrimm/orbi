import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { users } from "../db/schema";
import { sanitizeUser } from "../db/serialize";

export async function getProfile(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, req.userId)).limit(1);
  if (!user) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }
  res.json({ success: true, data: sanitizeUser(user) });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const { displayName, avatarUrl } = req.body;
  const db = getDb();
  const [user] = await db
    .update(users)
    .set({ displayName, avatarUrl, updatedAt: new Date() })
    .where(eq(users.id, req.userId))
    .returning();
  res.json({ success: true, data: sanitizeUser(user) });
}

export async function updatePreferences(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const [user] = await db
    .update(users)
    .set({ preferences: req.body, updatedAt: new Date() })
    .where(eq(users.id, req.userId))
    .returning();
  res.json({ success: true, data: sanitizeUser(user) });
}

export async function updatePersona(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const [user] = await db
    .update(users)
    .set({ persona: req.body, updatedAt: new Date() })
    .where(eq(users.id, req.userId))
    .returning();
  res.json({ success: true, data: sanitizeUser(user) });
}
