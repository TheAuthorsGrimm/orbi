import { Schema, model, Document, Types } from "mongoose";
import { TaskStatus, TaskPriority } from "@orbi/types";

export interface ITask extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedMinutes?: number;
  steps: {
    id: string;
    label: string;
    completed: boolean;
    estimatedMinutes?: number;
  }[];
  tags: string[];
  dueDate?: Date;
  completedAt?: Date;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    estimatedMinutes: { type: Number },
    steps: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        completed: { type: Boolean, default: false },
        estimatedMinutes: { type: Number },
      },
    ],
    tags: [{ type: String, trim: true }],
    dueDate: { type: Date },
    completedAt: { type: Date },
    aiGenerated: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Compound index for user task queries
TaskSchema.index({ userId: 1, status: 1, priority: -1 });
TaskSchema.index({ userId: 1, dueDate: 1 });

export const Task = model<ITask>("Task", TaskSchema);
