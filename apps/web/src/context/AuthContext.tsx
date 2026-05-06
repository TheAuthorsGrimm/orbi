import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth as authApi } from "@orbi/api-client";
import type { OrbiUser } from "@orbi/types";

interface AuthState {
  user: OrbiUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<OrbiUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("orbi_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then((res) => setUser(res.data.data ?? null))
      .catch(() => { localStorage.removeItem("orbi_token"); setToken(null); })
      .finally(() => setLoading(false));
  }, [token]);

  function persist(t: string, u: OrbiUser) {
    localStorage.setItem("orbi_token", t);
    setToken(t);
    setUser(u);
  }

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password);
    const { token: t, user: u } = res.data.data!;
    persist(t, u as OrbiUser);
  }

  async function register(email: string, password: string, displayName: string) {
    const res = await authApi.register(email, password, displayName);
    const { token: t, user: u } = res.data.data!;
    persist(t, u as OrbiUser);
  }

  function logout() {
    localStorage.removeItem("orbi_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
