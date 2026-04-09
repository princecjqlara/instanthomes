import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiError, getSession, login as loginRequest, logout as logoutRequest } from '@/lib/api';
import type { AuthUser } from '@/types/api';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function homePathForUser(user: AuthUser) {
  return user.role === 'admin' ? '/admin/tenants' : '/tenant/funnels';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const refreshSession = async () => {
    setStatus('loading');

    try {
      const response = await getSession();
      setUser(response.user);
      setStatus('authenticated');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        setStatus('unauthenticated');
        return;
      }

      setUser(null);
      setStatus('unauthenticated');
    }
  };

  useEffect(() => {
    void refreshSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      login: async (email: string, password: string) => {
        const response = await loginRequest(email, password);
        setUser(response.user);
        setStatus('authenticated');
        return response.user;
      },
      logout: async () => {
        await logoutRequest();
        setUser(null);
        setStatus('unauthenticated');
      },
      refreshSession,
    }),
    [status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
