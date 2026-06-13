import { pingDatabase, runMigrations } from "../db/client";

export type DbStatus = "disconnected" | "connecting" | "connected" | "error";

let status: DbStatus = "disconnected";
let lastError: string | null = null;

export function getDbStatus(): { status: DbStatus; lastError: string | null } {
  return { status, lastError };
}

export async function connectDatabase(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    status = "error";
    lastError = "DATABASE_URL environment variable is not set";
    throw new Error(lastError);
  }

  status = "connecting";
  lastError = null;

  try {
    await pingDatabase();
    if (process.env.RUN_MIGRATIONS_ON_BOOT === "true") {
      console.log("Running pending database migrations...");
      await runMigrations();
      console.log("Migrations complete.");
    }
    status = "connected";
    console.log("Postgres connected — Orbi database ready");
  } catch (err) {
    status = "error";
    lastError = err instanceof Error ? err.message : String(err);
    throw err;
  }
}
