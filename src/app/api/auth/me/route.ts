import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }
  const [user] = await db.select().from(users).where(eq(users.id, session.sub)).limit(1);
  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    data: {
      _id: user.id,
      email: user.email,
      displayName: user.displayName,
      tier: user.tier,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      preferences: {
        theme: "system",
        accentColor: "#7c6aff",
        notificationsEnabled: true,
        focusSessionDuration: 25,
        breakDuration: 5,
        timezone: "America/Halifax",
      },
    },
  });
}
