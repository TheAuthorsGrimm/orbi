import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  // Preferences are persisted client-side in localStorage until the users table
  // gains a preferences jsonb column. This route accepts the request so the
  // client PATCH is non-fatal, and can be wired to the DB in a follow-up migration.
  return NextResponse.json({ success: true, data: body });
}
