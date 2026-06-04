import { useState, useEffect, useCallback } from 'react';
import { tasks as tasksApi } from '@orbi/api-client';
import type { OrbiTask, TaskPriority, TaskStatus } from '@orbi/types';

export function useTasks() {
  const [needs, setNeeds] = useState<OrbiTask[]>([]);
  const [wants, setWants] = useState<OrbiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tasksApi.list();
      const all: OrbiTask[] = res.data.data ?? [];
      // Needs = urgent/high, Wants = medium/low
      setNeeds(all.filter(t => t.priority === 'urgent' || t.priority === 'high'));
      setWants(all.filter(t => t.priority === 'medium' || t.priority === 'low'));
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addTask = useCallback(async (title: string, priority: TaskPriority, list: 'needs' | 'wants') => {
    const res = await tasksApi.create({ title, priority, status: 'pending' as TaskStatus });
    const task = res.data.data!;
    if (list === 'needs') setNeeds(p => [task, ...p]);
    else setWants(p => [task, ...p]);
    return task;
  }, []);

  const toggleTask = useCallback(async (id: string, list: 'needs' | 'wants') => {
    const source = list === 'needs' ? needs : wants;
    const task = source.find(t => t._id === id);
    if (!task) return;
    const completing = task.status !== 'complete';
    if (completing) {
      await tasksApi.complete(id);
    } else {
      await tasksApi.update(id, { status: 'pending' as TaskStatus });
    }
    const update = (t: OrbiTask) => t._id === id
      ? { ...t, status: (completing ? 'complete' : 'pending') as TaskStatus }
      : t;
    if (list === 'needs') setNeeds(p => p.map(update));
    else setWants(p => p.map(update));
  }, [needs, wants]);

  const deleteTask = useCallback(async (id: string, list: 'needs' | 'wants') => {
    await tasksApi.delete(id);
    if (list === 'needs') setNeeds(p => p.filter(t => t._id !== id));
    else setWants(p => p.filter(t => t._id !== id));
  }, []);

  return { needs, wants, loading, error, addTask, toggleTask, deleteTask, reload: load };
}
