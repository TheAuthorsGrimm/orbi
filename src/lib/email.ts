import { Resend } from "resend";

/**
 * Thin wrapper around Resend so the rest of the app doesn't need to know
 * about the transport. Keeps the API key check in one spot.
 *
 * The `from` address must be on a domain you have verified in Resend.
 * Set EMAIL_FROM in Vercel env vars (e.g., "Orbi <hello@grimmforged.ca>").
 */

const FROM = process.env.EMAIL_FROM ?? "Orbi <onboarding@resend.dev>";

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(args: SendEmailArgs): Promise<void> {
  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
  });
}

/**
 * Password reset email. Keep the copy short — ADHD-friendly.
 */
export function buildPasswordResetEmail(displayName: string, resetUrl: string) {
  const subject = "Reset your Orbi password";
  const text = `Hey ${displayName},

Someone (hopefully you) asked to reset your Orbi password.
Click the link below within the next hour to pick a new one:

${resetUrl}

If it wasn't you, just ignore this email — your password stays the same.

— Orbi
by GrimmForged AI Solutions`;

  const html = `<!doctype html>
<html>
  <body style="font-family: -apple-system, system-ui, sans-serif; background: #080814; color: #e6e6f0; padding: 24px; line-height: 1.55;">
    <div style="max-width: 480px; margin: 0 auto; background: linear-gradient(160deg, #0f0e2a 0%, #0a0a18 100%); border: 1px solid rgba(82,80,243,0.25); border-radius: 12px; padding: 32px;">
      <h1 style="margin: 0 0 24px 0; font-family: 'Instrument Sans', system-ui, sans-serif; color: #ffffff; font-size: 24px;">Reset your Orbi password</h1>
      <p style="margin: 0 0 16px 0;">Hey ${escapeHtml(displayName)},</p>
      <p style="margin: 0 0 24px 0;">Someone (hopefully you) asked to reset your Orbi password. Click the button below within the next hour to pick a new one.</p>
      <p style="margin: 0 0 24px 0; text-align: center;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #5250f3, #0d9488); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">Reset password</a>
      </p>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #9a9ab8;">Or copy this link into your browser:<br><a href="${resetUrl}" style="color: #a5b4fc; word-break: break-all;">${resetUrl}</a></p>
      <p style="margin: 24px 0 0 0; font-size: 14px; color: #9a9ab8;">If it wasn't you, just ignore this email — your password stays the same.</p>
      <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0;">
      <p style="margin: 0; font-size: 12px; color: #6b6b8a; text-align: center;">Orbi · by GrimmForged AI Solutions</p>
    </div>
  </body>
</html>`;

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
