import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reminders } from "@/lib/db/schema";
import { requireUser, AuthError } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const deleted = await db
      .delete(reminders)
      .where(and(eq(reminders.id, id), eq(reminders.userId, user.id)))
      .returning({ id: reminders.id });

    if (!deleted.length) {
      return NextResponse.json({ success: false, error: "Reminder not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    throw err;
  }
}
