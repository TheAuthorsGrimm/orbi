import { Schema, model, Document, Types } from "mongoose";

export type ReminderTrigger = "time" | "location" | "context" | "ai";

export interface IReminder extends Document {
  userId: Types.ObjectId;
  taskId?: Types.ObjectId;
  title: string;
  triggerType: ReminderTrigger;
  triggerAt?: Date;
  recurrence?: string;
  sent: boolean;
  createdAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task" },
    title: { type: String, required: true, trim: true },
    triggerType: {
      type: String,
      enum: ["time", "location", "context", "ai"],
      required: true,
    },
    triggerAt: { type: Date },
    recurrence: { type: String },
    sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReminderSchema.index({ userId: 1, triggerAt: 1, sent: 1 });

export const Reminder = model<IReminder>("Reminder", ReminderSchema);
