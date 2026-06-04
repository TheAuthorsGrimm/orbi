import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:3001/api';

async function getToken() {
  return AsyncStorage.getItem('orbi_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Request failed');
  return json;
}

export const auth = {
  login: (email: string, password: string) =>
    request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, displayName: string) =>
    request<any>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, displayName }) }),
  me: () => request<any>('/auth/me'),
};

export const tasks = {
  list: () => request<any>('/tasks'),
  create: (data: any) => request<any>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  complete: (id: string) => request<any>(`/tasks/${id}/complete`, { method: 'PATCH' }),
  delete: (id: string) => request<any>(`/tasks/${id}`, { method: 'DELETE' }),
};

export const chat = {
  send: (content: string, sessionId?: string) =>
    request<any>('/chat', { method: 'POST', body: JSON.stringify({ content, sessionId }) }),
};

export const focus = {
  start: (taskId?: string, durationMinutes?: number) =>
    request<any>('/focus', { method: 'POST', body: JSON.stringify({ taskId, durationMinutes }) }),
  complete: (id: string, data: any) =>
    request<any>(`/focus/${id}/complete`, { method: 'PATCH', body: JSON.stringify(data) }),
};

export const reminders = {
  list: () => request<any>('/reminders'),
  create: (data: any) => request<any>('/reminders', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => request<any>(`/reminders/${id}`, { method: 'DELETE' }),
};
