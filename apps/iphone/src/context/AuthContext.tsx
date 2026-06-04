import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth as authApi } from '../services/api';

interface User {
  _id: string;
  email: string;
  displayName: string;
  tier: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('orbi_token').then(async token => {
      if (token) {
        try {
          const res = await authApi.me();
          setUser(res.data ?? null);
        } catch {
          await AsyncStorage.removeItem('orbi_token');
        }
      }
      setLoading(false);
    });
  }, []);

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password);
    await AsyncStorage.setItem('orbi_token', res.data.token);
    setUser(res.data.user);
  }

  async function register(email: string, password: string, displayName: string) {
    const res = await authApi.register(email, password, displayName);
    await AsyncStorage.setItem('orbi_token', res.data.token);
    setUser(res.data.user);
  }

  async function logout() {
    await AsyncStorage.removeItem('orbi_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
