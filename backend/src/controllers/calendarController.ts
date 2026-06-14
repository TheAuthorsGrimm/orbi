import { Request, Response } from "express";
import { User } from "../models/User";
import { getUpcomingEvents } from "../integrations/googleCalendar";

export async function getEvents(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.userId);
  if (!user?.googleRefreshToken) {
    res.status(400).json({ success: false, error: "Google Calendar not connected. Connect via /api/auth/google." });
    return;
  }
  const daysAhead = Number(req.query.daysAhead) || 7;
  const events = await getUpcomingEvents(user, daysAhead);
  res.json({ success: true, data: events });
}

export async function getAuthUrl(_req: Request, res: Response): Promise<void> {
  const { OAuth2Client } = await import("google-auth-library");
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
  });
  res.json({ success: true, data: { url } });
}

export async function handleCallback(req: Request, res: Response): Promise<void> {
  const { code } = req.query as { code: string };
  const { OAuth2Client } = await import("google-auth-library");
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
  const { tokens } = await oauth2Client.getToken(code);
  const db = getDb();
  await db
    .update(users)
    .set({
      googleAccessToken: tokens.access_token ?? null,
      googleRefreshToken: tokens.refresh_token ?? null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, req.userId));
  res.json({ success: true, message: "Google Calendar connected" });
}
