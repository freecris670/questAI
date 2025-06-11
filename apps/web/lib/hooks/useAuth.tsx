"use client";

import { useAuthStore } from '@/stores/auth.store';
import { supabase } from '@/lib/supabase/client';
import { AuthError, AuthResponse, Provider } from '@supabase/supabase-js';
import axios from 'axios';

/**
 * Хук для доступа к данным аутентификации и выполнения действий.
 * Является удобной оберткой над useAuthStore и Supabase.
 */
export function useAuth() {
  const { user, profile, isLoading, setUserAndProfile } = useAuthStore();
  
  const signInWithOAuth = (provider: Provider): Promise<AuthResponse> => {
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };
  
  const signOut = (): Promise<{ error: AuthError | null }> => {
    return supabase.auth.signOut();
  };

  const _handleAuthSuccess = async (token: string): Promise<{ error: AuthError | null }> => {
    // 1. Устанавливаем сессию в Supabase с помощью токена от бэкенда
    const { data: authData, error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: '' // Мы управляем сессией через наш бэкенд
    });

    if (error) return { error };
    if (!authData.session) return { error: new AuthError('Не удалось установить сессию')};

    // 2. Получаем профиль пользователя
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.session.user.id)
      .single();

    // 3. Обновляем наш стор
    setUserAndProfile(authData.session.user, profileData);

    // 4. Запускаем миграцию пробных квестов
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/migrate-trial-quests`, 
        {}, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (migrateError) {
      console.error('Ошибка при миграции пробных квестов (не критично):', migrateError);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email,
        password
      });

      if (response.data?.access_token) {
        const { error } = await _handleAuthSuccess(response.data.access_token);
        if (error) return { error: new Error(error.message) };
        return { error: null };
      }
      return { error: new Error('Неверный ответ от сервера') };
    } catch (error) {
      console.error('Ошибка входа:', error);
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Произошла ошибка при входе';
      return { error: new Error(message) };
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ error: Error | null }> => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        email,
        password,
        name
      });
      
      if (response.data?.access_token) {
        const { error } = await _handleAuthSuccess(response.data.access_token);
        if (error) return { error: new Error(error.message) };
        return { error: null };
      }
      return { error: new Error('Неверный ответ от сервера') };
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Произошла ошибка при регистрации';
      return { error: new Error(message) };
    }
  };

  return { 
    user, 
    profile, 
    loading: isLoading, 
    isLoggedIn: !!user,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
  };
}
