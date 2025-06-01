import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Маршруты, требующие авторизации
const PROTECTED_ROUTES = [
  // '/my-quests', // Разрешаем доступ неавторизованным пользователям
  '/settings',
  '/quest/create',
  '/quest/edit',
  '/auth/preferences',
  '/auth/profile',
];

// Маршруты, доступные только для неавторизованных пользователей
const AUTH_ROUTES = [
  '/auth',
  '/auth/reset-password',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Пропускаем API запросы для триальных квестов
  if (path.includes('/api/quests/generate/trial') || path.includes('/api/quests/trial')) {
    return NextResponse.next();
  }
  
  // Пропускаем API запросы пробных квестов
  if (path.startsWith('/quest/generating') || 
      path.startsWith('/quest/trial') ||
      path === '/') {
    return NextResponse.next();
  }
  
  // Проверяем переменные окружения
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // В режиме сборки просто пропускаем
    if (process.env.NODE_ENV === 'production' && !request.headers.get('user-agent')) {
      return NextResponse.next();
    }
    console.warn('Supabase environment variables are not set');
    return NextResponse.next();
  }
  
  // Создаем клиент Supabase для проверки авторизации
  const supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  
  // Проверяем сессию
  const { data: { session } } = await supabase.auth.getSession();
  
  // Защита маршрутов, требующих авторизации
  const isProtectedRoute = PROTECTED_ROUTES.some(route => path.startsWith(route));
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth', request.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Перенаправление авторизованных пользователей с авторизационных страниц
  const isAuthRoute = AUTH_ROUTES.some(route => path.startsWith(route));
  if (isAuthRoute && session) {
    // Если пользователь не завершил онбординг, перенаправляем на соответствующую страницу
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('completed_onboarding')
        .eq('id', session.user.id)
        .single();
      
      if (profile && !profile.completed_onboarding) {
        return NextResponse.redirect(new URL('/auth/preferences', request.url));
      }
      
      // Если пользователь полностью авторизован, отправляем на страницу квестов
      return NextResponse.redirect(new URL('/my-quests', request.url));
    } catch (error) {
      console.error('Ошибка при получении профиля в middleware:', error);
      return NextResponse.redirect(new URL('/my-quests', request.url));
    }
  }
  
  return supabaseResponse;
}

// Указываем, к каким маршрутам применять middleware
export const config = {
  matcher: [
    /*
     * Пропускаем все внутренние пути Next.js (_next)
     * Пропускаем статические файлы (статические, favicon, изображения и т.д.)
     * Пропускаем API запросы для триальных квестов
     */
    '/((?!_next/static|_next/image|favicon.ico|images|avatars|api/quests/generate/trial|api/quests/trial).*)',
  ],
};
