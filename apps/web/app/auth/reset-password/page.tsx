"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Проверяем, пришел ли токен восстановления
  const token = searchParams.get('token');
  
  // Запрос на восстановление пароля (отправка письма)
  const handleResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!email.trim()) {
      setError('Пожалуйста, введите email');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setSuccess('Инструкции по сбросу пароля отправлены на ваш email');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при отправке запроса';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Установка нового пароля
  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setSuccess('Пароль успешно изменен');
      
      // Перенаправляем на страницу авторизации через 3 секунды
      setTimeout(() => {
        router.push('/auth');
      }, 3000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при изменении пароля';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col">
      <MainHeader />
      <main className="flex-grow flex items-center justify-center px-4 py-12 pt-24">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-semibold text-[#2553A1] text-center mb-6">
            {token ? 'Установка нового пароля' : 'Восстановление пароля'}
          </h1>

          {!token ? (
            // Форма запроса сброса пароля
            <form onSubmit={handleResetRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#2553A1] hover:bg-[#2553A1]/90"
                disabled={isLoading}
              >
                {isLoading ? 'Отправка...' : 'Отправить инструкции'}
              </Button>
            </form>
          ) : (
            // Форма установки нового пароля
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Новый пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#2553A1] hover:bg-[#2553A1]/90"
                disabled={isLoading}
              >
                {isLoading ? 'Обновление...' : 'Обновить пароль'}
              </Button>
            </form>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth" className="text-sm text-[#2553A1] hover:underline">
              Вернуться на страницу входа
            </Link>
          </div>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
