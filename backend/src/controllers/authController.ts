import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { OrbiTier } from "@orbi/types";

function signToken(userId: string, tier: OrbiTier): string {
  return jwt.sign(
    { userId, tier },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
  );
}

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) {
    res.status(400).json({ success: false, error: "email, password, displayName required" });
    return;
  }
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ success: false, error: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash, displayName });
  const token = signToken(user._id.toString(), user.tier);
  res.status(201).json({ success: true, data: { token, user: sanitize(user) } });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, error: "email and password required" });
    return;
  }
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ success: false, error: "Invalid credentials" });
    return;
  }
  const token = signToken(user._id.toString(), user.tier);
  res.json({ success: true, data: { token, user: sanitize(user) } });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) { res.status(404).json({ success: false, error: "User not found" }); return; }
  res.json({ success: true, data: user });
}

function sanitize(user: InstanceType<typeof User>) {
  const obj = user.toObject() as unknown as Record<string, unknown>;
  delete obj.passwordHash;
  return obj;
}
