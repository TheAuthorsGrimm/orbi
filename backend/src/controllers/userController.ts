import { Request, Response } from "express";
import { User } from "../models/User";

export async function getProfile(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) { res.status(404).json({ success: false, error: "User not found" }); return; }
  res.json({ success: true, data: user });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const { displayName, avatarUrl } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userId,
    { displayName, avatarUrl },
    { new: true, runValidators: true }
  ).select("-passwordHash");
  res.json({ success: true, data: user });
}

export async function updatePreferences(req: Request, res: Response): Promise<void> {
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: { preferences: req.body } },
    { new: true, runValidators: true }
  ).select("-passwordHash");
  res.json({ success: true, data: user });
}

export async function updatePersona(req: Request, res: Response): Promise<void> {
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: { persona: req.body } },
    { new: true, runValidators: true }
  ).select("-passwordHash");
  res.json({ success: true, data: user });
}
