import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSession } from "@/lib/auth/session";

export const runtime = "nodejs";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  error?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

function errorRedirect(appUrl: string, message: string) {
  return NextResponse.redirect(`${appUrl}/#/login?sso_error=${encodeURIComponent(message)}`);
}

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return errorRedirect(appUrl, "Google sign-in is not configured.");
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return errorRedirect(appUrl, "Google sign-in was cancelled.");
  }

  if (!code || !state) {
    return errorRedirect(appUrl, "Invalid OAuth response.");
  }

  // Verify CSRF state
  const cookieStore = await cookies();
  const savedState = cookieStore.get("orbi_oauth_state")?.value;
  cookieStore.delete("orbi_oauth_state");

  if (!savedState || savedState !== state) {
    return errorRedirect(appUrl, "OAuth state mismatch. Please try again.");
  }

  // Exchange code for tokens
  const redirectUri = `${appUrl}/api/auth/google/callback`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
  if (tokenData.error || !tokenData.access_token) {
    return errorRedirect(appUrl, "Failed to authenticate with Google.");
  }

  // Fetch Google user profile
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = (await profileRes.json()) as GoogleUserInfo;

  if (!profile.email || !profile.email_verified) {
    return errorRedirect(appUrl, "Google account must have a verified email.");
  }

  const email = profile.email.toLowerCase().trim();

  // Find or create user
  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    const displayName = profile.name ?? email.split("@")[0];
    [user] = await db
      .insert(users)
      .values({ email, displayName, passwordHash: "$oauth$" })
      .returning();
  }

  await createSession(user.id, user.tier);

  return NextResponse.redirect(`${appUrl}/#/dashboard`);
}
