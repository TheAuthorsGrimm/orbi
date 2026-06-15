import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { sql as drizzleSql } from "drizzle-orm";
import path from "path";
import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

let _db: Db | null = null;

export function getDb(): Db {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = neon(url);
  _db = drizzle(sql, { schema });
  return _db;
}

export async function pingDatabase(): Promise<void> {
  const db = getDb();
  await db.execute(drizzleSql`select 1`);
}

export async function runMigrations(): Promise<void> {
  const db = getDb();
  // When run via `tsx src/server.ts` from backend/, cwd is backend/ → drizzle/.
  // When run via `node dist/server.js`, __dirname is backend/dist/db → ../../drizzle.
  const migrationsFolder = path.resolve(process.cwd(), "drizzle");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await migrate(db as any, { migrationsFolder });
}

export { schema };
