// =============================================================
// Google Calendar Integration Service
// Available on: Orbi Full tier only
// =============================================================

import type { IUser } from "../models/User";
import type { CalendarEvent } from "@orbi/types";

const GOOGLE_CALENDAR_BASE = "https://www.googleapis.com/calendar/v3";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

// -----------------------------------------------------------
// Token Management
// -----------------------------------------------------------
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) throw new Error("Failed to refresh Google access token");
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function getValidToken(user: IUser): Promise<string> {
  if (!user.googleRefreshToken) {
    throw new Error("Google Calendar not connected. Link your account in Settings.");
  }
  // In production: check token expiry, use stored access token if valid
  return refreshAccessToken(user.googleRefreshToken);
}

// -----------------------------------------------------------
// Fetch Events
// -----------------------------------------------------------
export async function getUpcomingEvents(
  user: IUser,
  daysAhead = 7
): Promise<CalendarEvent[]> {
  const token = await getValidToken(user);

  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "50",
  });

  const res = await fetch(`${GOOGLE_CALENDAR_BASE}/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch Google Calendar events");

  const data = (await res.json()) as { items?: Record<string, unknown>[] };
  return (data.items || []).map(mapGoogleEvent);
}

// -----------------------------------------------------------
// Create Event from Orbi Task
// -----------------------------------------------------------
export async function createEventFromTask(
  user: IUser,
  task: { title: string; description?: string; dueDate: Date; estimatedMinutes?: number }
): Promise<string> {
  const token = await getValidToken(user);

  const startTime = task.dueDate;
  const endTime = new Date(startTime.getTime() + (task.estimatedMinutes || 30) * 60 * 1000);

  const body = {
    summary: `[Orbi] ${task.title}`,
    description: task.description || "Created by Orbi",
    start: { dateTime: startTime.toISOString() },
    end: { dateTime: endTime.toISOString() },
  };

  const res = await fetch(`${GOOGLE_CALENDAR_BASE}/calendars/primary/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Failed to create Google Calendar event");
  const created = (await res.json()) as { id: string };
  return created.id;
}

// -----------------------------------------------------------
// Map Google Event to CalendarEvent
// -----------------------------------------------------------
function mapGoogleEvent(item: Record<string, unknown>): CalendarEvent {
  const start = item.start as Record<string, string>;
  const end = item.end as Record<string, string>;

  return {
    id: item.id as string,
    source: "google",
    title: (item.summary as string) || "Untitled",
    description: item.description as string | undefined,
    startAt: new Date(start.dateTime || start.date),
    endAt: new Date(end.dateTime || end.date),
    allDay: !start.dateTime,
  };
}
