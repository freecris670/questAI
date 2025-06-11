"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore, Profile } from '@/stores/auth.store';

/**
 * AuthHandler - это "слушатель", который синхронизирует состояние
 * аутентификации Supabase с нашим глобальным стором Zustand.
 * Он не рендерит UI.
 */
export function AuthHandler() {
  const setUserAndProfile = useAuthStore((state) => state.setUserAndProfile);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    // Начальная проверка сессии при загрузке приложения
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUserAndProfile(session.user, profile as Profile | null);
      } else {
        clearAuth();
      }
    };
    checkInitialSession();

    // Подписка на дальнейшие изменения состояния аутентификации
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user;

        if (currentUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          
          setUserAndProfile(currentUser, profile as Profile | null);
        } else if (event === 'SIGNED_OUT') {
          clearAuth();
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [setUserAndProfile, clearAuth]);

  return null;
} 