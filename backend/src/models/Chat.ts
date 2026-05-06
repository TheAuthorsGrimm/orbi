import { Schema, model, Document, Types } from "mongoose";

export interface IChatSession extends Document {
  userId: Types.ObjectId;
  title: string;
  summary?: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatMessage extends Document {
  sessionId: Types.ObjectId;
  userId: Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  toolUse?: {
    name: string;
    input: Record<string, unknown>;
    result?: unknown;
  }[];
  createdAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "New conversation" },
    summary: { type: String },
    messageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "ChatSession", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    toolUse: [
      {
        name: String,
        input: Schema.Types.Mixed,
        result: Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });

export const ChatSession = model<IChatSession>("ChatSession", ChatSessionSchema);
export const ChatMessage = model<IChatMessage>("ChatMessage", ChatMessageSchema);
