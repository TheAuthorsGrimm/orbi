import { useState, useEffect, useCallback } from 'react';
import { reminders as remindersApi } from '@orbi/api-client';
import type { Reminder } from '@orbi/types';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    remindersApi.list()
      .then((res: { data: { data?: Reminder[] } }) => setReminders(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addReminder = useCallback(async (data: Partial<Reminder>) => {
    const res = await remindersApi.create(data);
    const reminder = res.data.data!;
    setReminders(p => [reminder, ...p]);
    return reminder;
  }, []);

  const removeReminder = useCallback(async (id: string) => {
    await remindersApi.delete(id);
    setReminders(p => p.filter(r => r._id !== id));
  }, []);

  return { reminders, loading, addReminder, removeReminder };
}
