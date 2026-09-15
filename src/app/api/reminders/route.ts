import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { reminders } from "@/lib/db/schema";
import { requireUser, AuthError } from "@/lib/auth/session";

export const runtime = "nodejs";

function serialize<T extends { id: string }>(row: T) {
  return { ...row, _id: row.id };
}

export async function GET() {
  try {
    const user = await requireUser();
    const rows = await db
      .select()
      .from(reminders)
      .where(eq(reminders.userId, user.id));
    return NextResponse.json({ success: true, data: rows.map(serialize) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    throw err;
  }
}

const createSchema = z.object({
  title: z.string().min(1).max(255),
  triggerType: z.enum(["time", "location", "task"]).optional().default("time"),
  triggerTime: z.string().max(20).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = createSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const [row] = await db
      .insert(reminders)
      .values({
        userId: user.id,
        title: parsed.data.title,
        triggerType: parsed.data.triggerType,
        triggerTime: parsed.data.triggerTime ?? null,
      })
      .returning();

    return NextResponse.json({ success: true, data: serialize(row) }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    throw err;
  }
}
