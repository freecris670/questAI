import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // В режиме сборки возвращаем заглушку
      if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
        return null as any;
      }
      throw new Error('Отсутствуют необходимые переменные окружения для Supabase');
    }

    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      // Возвращаем заглушку для методов во время сборки
      return () => Promise.resolve({ data: null, error: null });
    }
    return client[prop as keyof SupabaseClient];
  }
});