/**
 * Конфигурация приложения
 */
const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  // API URL с fallback на localhost
  // В production среде используем Supabase напрямую через браузер
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  isProduction,
  
  // Supabase конфигурация
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
};

/**
 * Получить полный URL для API эндпоинта
 */
export function getApiUrl(endpoint: string): string {
  // Убираем лидирующий слеш если есть
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // Убираем trailing слеш из apiUrl если есть
  const baseUrl = config.apiUrl.endsWith('/') ? config.apiUrl.slice(0, -1) : config.apiUrl;
  
  return `${baseUrl}/${cleanEndpoint}`;
}
