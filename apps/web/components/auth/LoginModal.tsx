"use client";

import { useAuth } from '@/lib/hooks/useAuth';
import { useUIStore } from '@/stores/ui.store';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@repo/ui/components/ui/dialog';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useState } from 'react';

export function LoginModal() {
  const { signInWithOAuth, signIn, signUp } = useAuth();
  const { isLoginModalOpen, closeLoginModal } = useUIStore();

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      await signInWithOAuth(provider);
      closeLoginModal();
    } catch (err) {
      console.error('Sign in failed', err);
      setError('Не удалось войти через OAuth.');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = isLoginView
      ? await signIn(email, password)
      : await signUp(email, password, name);

    if (result.error) {
      setError(result.error.message);
    } else {
      closeLoginModal(); // Закрыть при успехе
    }
    setLoading(false);
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError(null);
  };

  return (
    <Dialog open={isLoginModalOpen} onOpenChange={closeLoginModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isLoginView ? 'Вход в QuestAI' : 'Регистрация в QuestAI'}</DialogTitle>
          <DialogDescription>
            {isLoginView ? 'Введите свои данные для входа.' : 'Создайте аккаунт, чтобы начать.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!isLoginView && (
              <Input
                id="name"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Подождите...' : isLoginView ? 'Войти' : 'Зарегистрироваться'}
            </Button>
          </DialogFooter>
        </form>
        
        <div className="relative my-4">
           <div className="absolute inset-0 flex items-center">
             <span className="w-full border-t" />
           </div>
           <div className="relative flex justify-center text-xs uppercase">
             <span className="bg-background px-2 text-muted-foreground">
               Или продолжить с
             </span>
           </div>
         </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('google')}
          >
            <FaGoogle className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('github')}
          >
            <FaGithub className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>
        
        <p className="px-8 text-center text-sm text-muted-foreground mt-4">
          <button onClick={toggleView} className="underline underline-offset-4 hover:text-primary">
            {isLoginView ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
          </button>
        </p>

      </DialogContent>
    </Dialog>
  );
}
