import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  // другие поля профиля могут быть добавлены здесь
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setUserAndProfile: (user: User | null, profile: Profile | null) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true, // true, пока мы не проверим сессию
  
  setUserAndProfile: (user, profile) => set({ user, profile, isLoading: false }),
  
  clearAuth: () => set({ user: null, profile: null, isLoading: false }),

  setLoading: (loading) => set({ isLoading: loading }),
})); 