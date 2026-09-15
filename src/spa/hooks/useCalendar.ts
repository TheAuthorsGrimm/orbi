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

  const createEvent = useCallback(async (data: Partial<CalendarEvent>) => {
    const res = await calendarApi.create(data);
    const event = res.data.data!;
    setEvents(p => [...p, event]);
    return event;
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    await calendarApi.delete(id);
    setEvents(p => p.filter(e => e.id !== id));
  }, []);

  return { events, loading, reload: load, createEvent, deleteEvent };
}
