import { useState, useEffect, useCallback } from 'react';
import { calendar as calendarApi } from '@/spa/api-client';
import type { CalendarEvent } from '@/spa/types';

export function useCalendar(year: number, month: number) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const start = new Date(year, month, 1).toISOString();
      const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const res = await calendarApi.events(start, end);
      setEvents(res.data.data ?? []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  return { events, loading, reload: load };
}
