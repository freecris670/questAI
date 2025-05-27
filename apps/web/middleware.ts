import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Маршруты, требующие авторизации
const PROTECTED_ROUTES = [
  '/my-quests',
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
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req: request, res });
  
  // Проверяем сессию
  const { data: { session } } = await supabase.auth.getSession();
  const path = request.nextUrl.pathname;
  
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
  
  return res;
}

// Указываем, к каким маршрутам применять middleware
export const config = {
  matcher: [
    /*
     * Пропускаем все внутренние пути Next.js (_next)
     * Пропускаем статические файлы (статические, favicon, изображения и т.д.)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|avatars).*)',
  ],
};

// Типы для базы данных
interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          avatar_url: string | null;
          character_name: string | null;
          preferences: Record<string, any> | null;
          completed_onboarding: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}
