import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
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
      .from(tasks)
      .where(eq(tasks.userId, user.id))
      .orderBy(desc(tasks.createdAt))
      .limit(200);
    return NextResponse.json({ success: true, data: rows.map(serialize) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    throw err;
  }
}

const createSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "complete", "deferred"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  dueDate: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = createSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const [row] = await db
      .insert(tasks)
      .values({
        userId: user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status ?? "pending",
        priority: parsed.data.priority ?? "medium",
        estimatedMinutes: parsed.data.estimatedMinutes,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      })
      .returning();
    return NextResponse.json({ success: true, data: serialize(row) }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    throw err;
  }
}
