import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

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
