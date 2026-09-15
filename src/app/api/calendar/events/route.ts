import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { calendarEvents } from "@/lib/db/schema";
import { requireUser, AuthError } from "@/lib/auth/session";

export const runtime = "nodejs";

function serialize<T extends { id: string }>(row: T) {
  return { ...row, _id: row.id };
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const conditions = [eq(calendarEvents.userId, user.id)];
    if (start) conditions.push(gte(calendarEvents.startAt, new Date(start)));
    if (end) conditions.push(lte(calendarEvents.startAt, new Date(end)));

    const rows = await db
      .select()
      .from(calendarEvents)
      .where(and(...conditions));

    return NextResponse.json({ success: true, data: rows.map(serialize) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    throw err;
  }
}

const createSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  source: z.enum(["orbi", "google", "personal"]).optional().default("orbi"),
  linkedTaskId: z.string().uuid().optional(),
  color: z.string().max(20).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = createSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const [row] = await db
      .insert(calendarEvents)
      .values({
        userId: user.id,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        startAt: new Date(parsed.data.startAt),
        endAt: new Date(parsed.data.endAt),
        source: parsed.data.source,
        linkedTaskId: parsed.data.linkedTaskId ?? null,
        color: parsed.data.color ?? null,
      })
      .returning();

    return NextResponse.json({ success: true, data: serialize(row) }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    throw err;
  }
}
