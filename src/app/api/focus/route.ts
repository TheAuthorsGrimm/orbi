import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { focusSessions } from "@/lib/db/schema";
import { requireUser, AuthError } from "@/lib/auth/session";

export const runtime = "nodejs";

function serialize<T extends { id: string }>(row: T) {
  return { ...row, _id: row.id };
}

export async function GET() {
  try {
    const user = await requireUser();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const rows = await db
      .select()
      .from(focusSessions)
      .where(and(eq(focusSessions.userId, user.id), gte(focusSessions.createdAt, todayStart)))
      .orderBy(desc(focusSessions.createdAt));
    return NextResponse.json({ success: true, data: rows.map(serialize) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    throw err;
  }
}

const startSchema = z.object({
  taskId: z.string().uuid().optional(),
  durationMinutes: z.number().int().min(1).max(180).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = startSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const [row] = await db
      .insert(focusSessions)
      .values({
        userId: user.id,
        taskId: parsed.data.taskId ?? null,
        durationMinutes: parsed.data.durationMinutes ?? 25,
      })
      .returning();
    return NextResponse.json({ success: true, data: serialize(row) }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    throw err;
  }
}
