import { Request, Response } from "express";
import { Types } from "mongoose";
import { v4 as uuid } from "uuid";
import { Task } from "../models/Task";
import { User } from "../models/User";
import { OrbiTier, TaskStatus } from "@orbi/types";
import { decomposeTask } from "../services/orbiAgent";

const FREE_TASK_LIMIT = 5;

export async function listTasks(req: Request, res: Response): Promise<void> {
  const { status, priority, page = 1, limit = 20 } = req.query;
  const filter: Record<string, unknown> = { userId: req.userId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  const tasks = await Task.find(filter)
    .sort({ priority: -1, createdAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);
  const total = await Task.countDocuments(filter);
  res.json({ success: true, data: tasks, total, page: +page, limit: +limit, hasMore: total > +page * +limit });
}

export async function getTask(req: Request, res: Response): Promise<void> {
  const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
  if (!task) { res.status(404).json({ success: false, error: "Task not found" }); return; }
  res.json({ success: true, data: task });
}

export async function createTask(req: Request, res: Response): Promise<void> {
  // Free tier limit
  if (req.userTier === OrbiTier.FREE) {
    const activeCount = await Task.countDocuments({
      userId: req.userId,
      status: { $in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
    });
    if (activeCount >= FREE_TASK_LIMIT) {
      res.status(403).json({
        success: false,
        error: `Free plan is limited to ${FREE_TASK_LIMIT} active tasks. Upgrade to Orbi Agent for unlimited tasks.`,
      });
      return;
    }
  }
  const task = await Task.create({ ...req.body, userId: req.userId });
  res.status(201).json({ success: true, data: task });
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const update = { ...req.body };
  if (update.status === TaskStatus.COMPLETE && !update.completedAt) {
    update.completedAt = new Date();
  }
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    update,
    { new: true, runValidators: true }
  );
  if (!task) { res.status(404).json({ success: false, error: "Task not found" }); return; }
  res.json({ success: true, data: task });
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!task) { res.status(404).json({ success: false, error: "Task not found" }); return; }
  res.json({ success: true, message: "Task deleted" });
}

export async function decomposeTaskHandler(req: Request, res: Response): Promise<void> {
  const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
  if (!task) { res.status(404).json({ success: false, error: "Task not found" }); return; }
  const user = await User.findById(req.userId);
  if (!user) { res.status(404).json({ success: false, error: "User not found" }); return; }

  const rawSteps = await decomposeTask(task.title, task.description, user);
  const steps = rawSteps.map((s) => ({ id: uuid(), ...s, completed: false }));
  task.steps = steps;
  task.aiGenerated = true;
  await task.save();
  res.json({ success: true, data: task });
}

export async function updateStep(req: Request, res: Response): Promise<void> {
  const { id, stepId } = req.params;
  const task = await Task.findOne({ _id: id, userId: req.userId });
  if (!task) { res.status(404).json({ success: false, error: "Task not found" }); return; }
  const step = task.steps.find((s) => s.id === stepId);
  if (!step) { res.status(404).json({ success: false, error: "Step not found" }); return; }
  Object.assign(step, req.body);
  await task.save();
  res.json({ success: true, data: task });
}
