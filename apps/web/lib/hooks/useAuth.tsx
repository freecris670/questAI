import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

interface UserProfile {
  id: string;
  avatar_url: string | null;
  character_name: string | null;
  completed_onboarding: boolean;
  preferences: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Инициализация сессии и настройка слушателя изменений авторизации
    const initializeAuth = async () => {
      setLoading(true);
      
      // Получаем текущую сессию
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Ошибка получения сессии:', error);
      } else if (session) {
        setSession(session);
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
      
      // Настраиваем слушатель изменений сессии
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setProfile(null);
          }
          
          setLoading(false);
        }
      );
      
      // Отписываемся от слушателя при размонтировании компонента
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, []);

  // Получение профиля пользователя из Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Ошибка получения профиля:', error);
        return;
      }
      
      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Ошибка при запросе профиля:', error);
    }
  };

  // Методы для работы с аутентификацией
  const signIn = async (_email: string, _password: string) => {
    try {
      // Используем наш API-эндпоинт вместо прямого вызова Supabase
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email: _email,
        password: _password
      }, {
        withCredentials: true
      });
      
      if (response.data && response.data.token) {
        // Успешный вход, обновляем сессию вручную
        const { data: authData } = await supabase.auth.setSession({
          access_token: response.data.token,
          refresh_token: ''
        });
        
        // Обновляем состояние
        setSession(authData.session);
        setUser(authData.session?.user ?? null);
        
        if (authData.session?.user) {
          await fetchUserProfile(authData.session.user.id);
        }
        
        // Дополнительно запускаем миграцию пробных квестов
        if (authData.session) {
          try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/migrate-trial-quests`, {}, {
              headers: {
                Authorization: `Bearer ${response.data.token}`
              },
              withCredentials: true
            });
          } catch (migrateError) {
            console.error('Ошибка при миграции пробных квестов:', migrateError);
            // Не выбрасываем ошибку, чтобы не блокировать авторизацию
          }
        }
        
        return { error: null };
      }
      
      return { error: new Error('Неверный ответ от сервера') };
    } catch (error) {
      console.error('Ошибка входа:', error);
      return { error: error as Error };
    }
  };

  const signUp = async (_email: string, _password: string) => {
    try {
      // Используем наш API-эндпоинт для регистрации
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        email: _email,
        password: _password,
        name: _email.split('@')[0] // временно используем часть email как имя
      }, {
        withCredentials: true
      });
      
      if (response.data && response.data.token) {
        // Успешная регистрация, обновляем сессию вручную
        const { data: authData } = await supabase.auth.setSession({
          access_token: response.data.token,
          refresh_token: ''
        });
        
        // Обновляем состояние
        setSession(authData.session);
        setUser(authData.session?.user ?? null);
        
        if (authData.session?.user) {
          await fetchUserProfile(authData.session.user.id);
        }
        
        // Дополнительно запускаем миграцию пробных квестов
        if (authData.session) {
          try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/migrate-trial-quests`, {}, {
              headers: {
                Authorization: `Bearer ${response.data.token}`
              },
              withCredentials: true
            });
          } catch (migrateError) {
            console.error('Ошибка при миграции пробных квестов:', migrateError);
            // Не выбрасываем ошибку, чтобы не блокировать регистрацию
          }
        }
        
        return { error: null };
      }
      
      return { error: new Error('Неверный ответ от сервера') };
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    // Выход через Supabase пока оставляем, т.к. он очищает локальные данные о сессии
    await supabase.auth.signOut();
    router.push('/');
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const resetPassword = async (_email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(_email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      return { error };
    } catch (error) {
      console.error('Ошибка сброса пароля:', error);
      return { error: error as Error };
    }
  };

  // Значение контекста
  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  
  return context;
}
