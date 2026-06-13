import mongoose from "mongoose";

export type DbStatus = "disconnected" | "connecting" | "connected" | "error";

let status: DbStatus = "disconnected";
let lastError: string | null = null;

export function getDbStatus(): { status: DbStatus; lastError: string | null } {
  return { status, lastError };
}

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    status = "error";
    lastError = "MONGODB_URI environment variable is not set";
    throw new Error(lastError);
  }

  status = "connecting";
  lastError = null;

  mongoose.connection.on("error", (err) => {
    status = "error";
    lastError = err?.message ?? String(err);
    console.error("MongoDB error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    status = "disconnected";
    console.warn("MongoDB disconnected");
  });

  mongoose.connection.on("connected", () => {
    status = "connected";
    lastError = null;
  });

  await mongoose.connect(uri, {
    dbName: "orbi",
    serverApi: {
      version: "1",
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 10_000,
  });

  status = "connected";
  console.log("MongoDB connected — Orbi database ready");
}
