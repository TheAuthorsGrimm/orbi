import { Request, Response } from "express";
import { User } from "../models/User";
import { listCalendarEvents } from "../integrations/googleCalendar";

export async function getEvents(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.userId);
  if (!user?.googleAccessToken) {
    res.status(400).json({ success: false, error: "Google Calendar not connected. Connect via /api/auth/google." });
    return;
  }
  const { timeMin, timeMax } = req.query as { timeMin?: string; timeMax?: string };
  const events = await listCalendarEvents(user.googleAccessToken, user.googleRefreshToken, timeMin, timeMax);
  res.json({ success: true, data: events });
}

export async function getAuthUrl(_req: Request, res: Response): Promise<void> {
  const { OAuth2Client } = await import("google-auth-library");
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
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
    process.env.GOOGLE_REDIRECT_URI
  );
  const { tokens } = await oauth2Client.getToken(code);
  await User.findByIdAndUpdate(req.userId, {
    googleAccessToken: tokens.access_token,
    googleRefreshToken: tokens.refresh_token,
  });
  res.json({ success: true, message: "Google Calendar connected" });
}
