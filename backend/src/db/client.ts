import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import path from "path";
import * as schema from "./schema";

type Db = NodePgDatabase<typeof schema>;

let _pool: Pool | null = null;
let _db: Db | null = null;

export function getDb(): Db {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  _pool = new Pool({
    connectionString: url,
    ssl: url.includes("sslmode=") ? undefined : { rejectUnauthorized: false },
    max: 10,
  });
  _db = drizzle(_pool, { schema });
  return _db;
}

export async function pingDatabase(): Promise<void> {
  const db = getDb();
  await db.execute("select 1");
}

export async function runMigrations(): Promise<void> {
  const db = getDb();
  const migrationsFolder = path.resolve(__dirname, "../../drizzle");
  await migrate(db, { migrationsFolder });
}

export { schema };
