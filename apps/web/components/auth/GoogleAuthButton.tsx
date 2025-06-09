"use client";

import { Button } from '@/components/ui/button';
import { FaGoogle } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

interface GoogleAuthButtonProps {
  onError?: (error: string) => void;
  onSuccess?: () => void;
  className?: string;
}

export function GoogleAuthButton({ onError, onSuccess, className }: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      // Если signInWithOAuth успешно, браузер будет перенаправлен на Google
      // После авторизации пользователь вернется на /auth/callback
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при входе через Google.';
      console.error('Google OAuth error:', error);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      type="button" 
      variant="outline" 
      className={`w-full flex items-center justify-center gap-2 cursor-pointer ${className || ''}`}
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      <FaGoogle className="text-[#4285F4]" />
      <span>{isLoading ? 'Подключение...' : 'Google'}</span>
    </Button>
  );
}
