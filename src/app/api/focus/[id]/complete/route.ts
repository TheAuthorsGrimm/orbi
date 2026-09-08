import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { focusSessions } from "@/lib/db/schema";
import { requireUser, AuthError } from "@/lib/auth/session";

export const runtime = "nodejs";

function serialize<T extends { id: string }>(row: T) {
  return { ...row, _id: row.id };
}

const completeSchema = z.object({
  interruptionCount: z.number().int().min(0).optional(),
  energyLevel: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const parsed = completeSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(focusSessions)
      .where(and(eq(focusSessions.id, id), eq(focusSessions.userId, user.id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(focusSessions)
      .set({
        completedAt: new Date(),
        interruptionCount: parsed.data.interruptionCount ?? existing.interruptionCount,
        energyLevel: parsed.data.energyLevel ?? existing.energyLevel,
        notes: parsed.data.notes ?? existing.notes,
      })
      .where(eq(focusSessions.id, id))
      .returning();

    return NextResponse.json({ success: true, data: serialize(updated) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    throw err;
  }
}
