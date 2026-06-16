import { useState, useCallback } from 'react';
import { focus as focusApi, tasks as tasksApi } from '@/spa/api-client';
import type { FocusSession, OrbiTask } from '@/spa/types';

export function useFocus() {
  const [activeSessions, setActiveSessions] = useState<FocusSession[]>([]);
  const [tasks, setTasks] = useState<OrbiTask[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    const res = await tasksApi.list();
    setTasks((res.data.data ?? []).filter((t: OrbiTask) => t.status !== 'complete'));
  }, []);

  const startSession = useCallback(async (taskId?: string, durationMinutes?: number) => {
    setLoading(true);
    try {
      const res = await focusApi.start(taskId, durationMinutes);
      return res.data.data!;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeSession = useCallback(async (id: string, data: { interruptionCount: number; energyLevel?: 1|2|3|4|5; notes?: string }) => {
    const res = await focusApi.complete(id, data);
    setActiveSessions(p => [...p, res.data.data!]);
    return res.data.data!;
  }, []);

  return { tasks, activeSessions, loading, loadTasks, startSession, completeSession };
}
