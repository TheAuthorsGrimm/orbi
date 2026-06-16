import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ status: "ok", db: "connected", timestamp: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      {
        status: "degraded",
        db: "error",
        dbError: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
