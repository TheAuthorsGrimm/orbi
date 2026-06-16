import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { requireUser, AuthError } from "@/lib/auth/session";

export const runtime = "nodejs";

const patchSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["pending", "in_progress", "complete", "deferred"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

function serialize<T extends { id: string }>(row: T) {
  return { ...row, _id: row.id };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const update: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
    if (parsed.data.dueDate) update.dueDate = new Date(parsed.data.dueDate);
    if (parsed.data.status === "complete") update.completedAt = new Date();

    const [row] = await db
      .update(tasks)
      .set(update)
      .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
      .returning();
    if (!row) return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: serialize(row) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    throw err;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const [deleted] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
      .returning({ id: tasks.id });
    if (!deleted) return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    throw err;
  }
}
