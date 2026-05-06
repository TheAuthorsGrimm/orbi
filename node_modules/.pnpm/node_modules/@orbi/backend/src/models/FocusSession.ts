import { Schema, model, Document, Types } from "mongoose";

export interface IFocusSession extends Document {
  userId: Types.ObjectId;
  taskId?: Types.ObjectId;
  durationMinutes: number;
  completedAt?: Date;
  interruptionCount: number;
  energyLevel?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt: Date;
}

const FocusSessionSchema = new Schema<IFocusSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task" },
    durationMinutes: { type: Number, required: true },
    completedAt: { type: Date },
    interruptionCount: { type: Number, default: 0 },
    energyLevel: { type: Number, min: 1, max: 5 },
    notes: { type: String },
  },
  { timestamps: true }
);

FocusSessionSchema.index({ userId: 1, createdAt: -1 });

export const FocusSession = model<IFocusSession>("FocusSession", FocusSessionSchema);
