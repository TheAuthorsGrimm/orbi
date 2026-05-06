import axios, { type AxiosInstance } from "axios";
import type {
  ApiResponse,
  OrbiUser,
  OrbiTask,
  ChatSession,
  ChatMessage,
  FocusSession,
  Reminder,
  CalendarEvent,
} from "@orbi/types";

const BASE_URL = import.meta.env?.VITE_API_URL ?? "/api";

function createClient(): AxiosInstance {
  const client = axios.create({ baseURL: BASE_URL, timeout: 15_000 });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("orbi_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("orbi_token");
        window.location.href = "/login";
      }
      return Promise.reject(err);
    }
  );

  return client;
}

const http = createClient();

// ------------------------------------------------------------------
// Auth
// ------------------------------------------------------------------
export const auth = {
  login: (email: string, password: string) =>
    http.post<ApiResponse<{ token: string; user: OrbiUser }>>("/auth/login", { email, password }),

  register: (email: string, password: string, displayName: string) =>
    http.post<ApiResponse<{ token: string; user: OrbiUser }>>("/auth/register", { email, password, displayName }),

  me: () => http.get<ApiResponse<OrbiUser>>("/auth/me"),
};

// ------------------------------------------------------------------
// Tasks
// ------------------------------------------------------------------
export const tasks = {
  list: () => http.get<ApiResponse<OrbiTask[]>>("/tasks"),
  get: (id: string) => http.get<ApiResponse<OrbiTask>>(`/tasks/${id}`),
  create: (data: Partial<OrbiTask>) => http.post<ApiResponse<OrbiTask>>("/tasks", data),
  update: (id: string, data: Partial<OrbiTask>) => http.patch<ApiResponse<OrbiTask>>(`/tasks/${id}`, data),
  delete: (id: string) => http.delete<ApiResponse>(`/tasks/${id}`),
  complete: (id: string) => http.patch<ApiResponse<OrbiTask>>(`/tasks/${id}/complete`),
};

// ------------------------------------------------------------------
// Chat
// ------------------------------------------------------------------
export const chat = {
  sessions: () => http.get<ApiResponse<ChatSession[]>>("/chat/sessions"),
  messages: (sessionId: string) => http.get<ApiResponse<ChatMessage[]>>(`/chat/sessions/${sessionId}`),
  send: (content: string, sessionId?: string) =>
    http.post<ApiResponse<{ message: ChatMessage; sessionId: string }>>("/chat", { content, sessionId }),
};

// ------------------------------------------------------------------
// Focus
// ------------------------------------------------------------------
export const focus = {
  list: () => http.get<ApiResponse<FocusSession[]>>("/focus"),
  start: (taskId?: string, durationMinutes?: number) =>
    http.post<ApiResponse<FocusSession>>("/focus", { taskId, durationMinutes }),
  complete: (id: string, data: Partial<FocusSession>) =>
    http.patch<ApiResponse<FocusSession>>(`/focus/${id}/complete`, data),
};

// ------------------------------------------------------------------
// Reminders
// ------------------------------------------------------------------
export const reminders = {
  list: () => http.get<ApiResponse<Reminder[]>>("/reminders"),
  create: (data: Partial<Reminder>) => http.post<ApiResponse<Reminder>>("/reminders", data),
  delete: (id: string) => http.delete<ApiResponse>(`/reminders/${id}`),
};

// ------------------------------------------------------------------
// Calendar
// ------------------------------------------------------------------
export const calendar = {
  events: (start: string, end: string) =>
    http.get<ApiResponse<CalendarEvent[]>>("/calendar/events", { params: { start, end } }),
};

// ------------------------------------------------------------------
// Users / Profile
// ------------------------------------------------------------------
export const users = {
  updateProfile: (data: Partial<OrbiUser>) => http.patch<ApiResponse<OrbiUser>>("/users/me", data),
};

export default { auth, tasks, chat, focus, reminders, calendar, users };
