'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { password?: string; data?: { full_name?: string; avatar_url?: string } }) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, [supabase.auth]);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, [supabase.auth]);

  const verifyOtp = useCallback(async (email: string, token: string) => {
    const { error, data } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    if (data?.session) {
      setUser(data.session.user);
    }
    return { error: error?.message ?? null };
  }, [supabase.auth]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase.auth]);

  const updateProfile = useCallback(async (updates: { password?: string; data?: { full_name?: string; avatar_url?: string } }) => {
    const { error, data } = await supabase.auth.updateUser(updates);
    if (data?.user) {
      setUser(data.user);
    }
    return { error: error?.message ?? null };
  }, [supabase.auth]);

  const deleteAccount = useCallback(async () => {
    const { error } = await supabase.rpc('delete_user');
    if (error) return { error: error.message };
    await supabase.auth.signOut();
    setUser(null);
    return { error: null };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, verifyOtp, signOut, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
