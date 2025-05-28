import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Обработка ошибок при установке cookies
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Ошибка обмена кода на сессию:', error);
      return NextResponse.redirect(new URL('/auth?error=auth_callback_error', requestUrl.origin));
    }

    // Проверяем, новый ли пользователь
    const { data: userExists } = await supabase
      .from('profiles')
      .select('id, completed_onboarding')
      .eq('id', data.user.id)
      .single();

    // Если пользователь новый или не завершил онбординг, перенаправляем на опрос предпочтений
    if (!userExists || !userExists.completed_onboarding) {
      return NextResponse.redirect(new URL('/auth/preferences', requestUrl.origin));
    }

    // Иначе перенаправляем на главную страницу или страницу квестов
    return NextResponse.redirect(new URL('/my-quests', requestUrl.origin));
  }

  // Если код отсутствует, перенаправляем на страницу авторизации
  return NextResponse.redirect(new URL('/auth', requestUrl.origin));
}
