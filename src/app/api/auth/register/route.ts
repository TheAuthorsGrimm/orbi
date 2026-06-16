import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(255),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const displayName = parsed.data.displayName.trim();

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const [user] = await db.insert(users).values({ email, displayName, passwordHash }).returning();

  await createSession(user.id, user.tier);

  return NextResponse.json({
    success: true,
    data: {
      user: {
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
    },
  });
}
