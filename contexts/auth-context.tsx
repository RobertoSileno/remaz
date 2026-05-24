import { api, ApiError, Customer } from '@/services/api';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  user: Customer | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (name: string, cpf: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const response = await api.me();
      setUser(response.user);
    } catch (error) {
      if (error instanceof ApiError && error.status !== 401) {
        throw error;
      }
      setUser(null);
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signIn: async (identifier, password) => {
      setUser(await api.login(identifier, password));
    },
    signUp: async (name, cpf, email, password) => {
      setUser(await api.register(name, cpf, email, password));
    },
    signOut: async () => {
      await api.logout();
      setUser(null);
    },
    refresh,
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
