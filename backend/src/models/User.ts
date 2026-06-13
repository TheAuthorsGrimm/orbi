import { Schema, model, Document } from "mongoose";
import { OrbiTier } from "@orbi/types";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  displayName: string;
  avatarUrl?: string;
  tier: OrbiTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  persona?: {
    name: string;
    tone: string;
    motivationStyle: string;
    checkInFrequency: string;
    customTraits: string[];
  };
  preferences: {
    theme: string;
    accentColor: string;
    notificationsEnabled: boolean;
    focusSessionDuration: number;
    breakDuration: number;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    avatarUrl: { type: String },
    tier: {
      type: String,
      enum: Object.values(OrbiTier),
      default: OrbiTier.FREE,
    },
    stripeCustomerId: { type: String, index: true },
    stripeSubscriptionId: { type: String },
    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
    persona: {
      name: { type: String, default: "Orbi" },
      tone: {
        type: String,
        enum: ["gentle", "energetic", "focused", "playful"],
        default: "gentle",
      },
      motivationStyle: {
        type: String,
        enum: ["encouragement", "challenge", "neutral"],
        default: "encouragement",
      },
      checkInFrequency: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      customTraits: [{ type: String }],
    },
    preferences: {
      theme: { type: String, enum: ["dark", "light", "system"], default: "system" },
      accentColor: { type: String, default: "#7c6aff" },
      notificationsEnabled: { type: Boolean, default: true },
      focusSessionDuration: { type: Number, default: 25 },
      breakDuration: { type: Number, default: 5 },
      timezone: { type: String, default: "America/Halifax" },
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", UserSchema);
