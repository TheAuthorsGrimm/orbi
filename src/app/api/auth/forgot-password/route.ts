import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/auth/tokens";
import { sendEmail, buildPasswordResetEmail } from "@/lib/email";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
});

/**
 * Always returns 200 success — we never reveal whether an email is registered.
 * Real users get an email; unknown addresses just get nothing.
 */
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Enter a valid email address." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  // Silent no-op if the account doesn't exist — do the response so callers
  // can't time-attack to enumerate accounts.
  if (!user) {
    return NextResponse.json({ success: true });
  }

  // Rate-limit: at most 3 outstanding (non-expired, non-used) tokens per user.
  const outstanding = await db
    .select({ id: passwordResetTokens.id })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.userId, user.id),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    );
  if (outstanding.length >= 3) {
    return NextResponse.json({ success: true });
  }

  const { raw, hash } = generateResetToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: hash,
    expiresAt,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  // SPA uses hash router — this is what the client renders as /reset-password?token=...
  const resetUrl = `${baseUrl}/#/reset-password?token=${encodeURIComponent(raw)}`;

  try {
    const { subject, html, text } = buildPasswordResetEmail(user.displayName, resetUrl);
    await sendEmail({ to: user.email, subject, html, text });
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    // We still return success so callers can't fingerprint config errors.
    // The token exists in the DB — worst case the user requests another one.
  }

  return NextResponse.json({ success: true });
}
