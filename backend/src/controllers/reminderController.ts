import { Request, Response } from "express";
import { Reminder } from "../models/Reminder";

export async function listReminders(req: Request, res: Response): Promise<void> {
  const reminders = await Reminder.find({ userId: req.userId }).sort({ triggerAt: 1 });
  res.json({ success: true, data: reminders });
}

export async function createReminder(req: Request, res: Response): Promise<void> {
  const reminder = await Reminder.create({ ...req.body, userId: req.userId });
  res.status(201).json({ success: true, data: reminder });
}

export async function updateReminder(req: Request, res: Response): Promise<void> {
  const reminder = await Reminder.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  if (!reminder) { res.status(404).json({ success: false, error: "Reminder not found" }); return; }
  res.json({ success: true, data: reminder });
}

export async function deleteReminder(req: Request, res: Response): Promise<void> {
  await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ success: true, message: "Reminder deleted" });
}
