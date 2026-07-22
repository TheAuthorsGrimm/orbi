import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { hashResetToken } from "@/lib/auth/tokens";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const tokenHash = hashResetToken(parsed.data.token);

  // Look up an unused, non-expired token that matches.
  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        gt(passwordResetTokens.expiresAt, new Date()),
        isNull(passwordResetTokens.usedAt),
      ),
    )
    .limit(1);

  if (!row) {
    return NextResponse.json(
      { success: false, error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 },
    );
  }

  // Update password + invalidate token in one small dance (no txn since neon-http
  // doesn't do them — but the ops are idempotent-ish and order is safe).
  const newHash = await hashPassword(parsed.data.password);
  await db
    .update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, row.userId));

  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, row.id));

  return NextResponse.json({ success: true });
}
