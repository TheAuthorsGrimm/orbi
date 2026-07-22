import crypto from "node:crypto";

/**
 * Password reset tokens.
 *
 * The raw token is 32 random bytes → base64url (43 chars). It ONLY
 * appears in the reset URL emailed to the user. The DB stores
 * sha256(token) so a database leak doesn't hand attackers usable tokens.
 */
export function generateResetToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString("base64url");
  const hash = hashResetToken(raw);
  return { raw, hash };
}

export function hashResetToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// 1 hour — long enough to be practical, short enough to limit exposure.
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
