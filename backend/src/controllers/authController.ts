import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { OrbiTier } from "@orbi/types";
import { getDb } from "../db/client";
import { users } from "../db/schema";
import { sanitizeUser } from "../db/serialize";

function signToken(userId: string, tier: OrbiTier): string {
  return jwt.sign(
    { userId, tier },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions,
  );
}

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) {
    res.status(400).json({ success: false, error: "email, password, displayName required" });
    return;
  }

  const db = getDb();
  const normalizedEmail = String(email).toLowerCase().trim();

  const existing = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ success: false, error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db
    .insert(users)
    .values({ email: normalizedEmail, passwordHash, displayName: String(displayName).trim() })
    .returning();

  const token = signToken(user.id, user.tier as OrbiTier);
  res.status(201).json({ success: true, data: { token, user: sanitizeUser(user) } });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, error: "email and password required" });
    return;
  }

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, String(email).toLowerCase().trim()))
    .limit(1);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ success: false, error: "Invalid credentials" });
    return;
  }

  const token = signToken(user.id, user.tier as OrbiTier);
  res.json({ success: true, data: { token, user: sanitizeUser(user) } });
}

export async function me(req: Request, res: Response): Promise<void> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, req.userId)).limit(1);
  if (!user) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }
  res.json({ success: true, data: sanitizeUser(user) });
}
