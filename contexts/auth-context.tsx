'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zsindia.com/api/v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.message || 'Login failed' } };
      }

      const userData = {
        name: email,
        email: password,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);
      setUser(userData);
      router.push('/dashboard');

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Network error' } };
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.message || 'Sign up failed' } };
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Network error' } };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/user/signin');
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
