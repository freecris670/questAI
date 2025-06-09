"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Assuming you have an Input component from Shadcn/ui
import { X } from 'lucide-react'; // For the close icon
import { useAuth } from '@/lib/hooks/useAuth';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      let result;
      
      if (isLogin) {
        // Логин
        result = await signIn(email, password);
      } else {
        // Регистрация
        result = await signUp(email, password);
      }
      
      if (result.error) {
        setError(result.error.message || 'Произошла ошибка. Пожалуйста, попробуйте снова.');
      } else {
        // Успешный вход/регистрация
        onClose();
      }
    } catch (err) {
      setError('Произошла ошибка при подключении к серверу.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-semibold text-quest-blue mb-6 text-center">
          {isLogin ? 'Вход в QuestAI' : 'Регистрация в QuestAI'}
        </h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <Input 
                type="text" 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя" 
                className="w-full" 
                required={!isLogin}
              />
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" 
              className="w-full" 
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <Input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full" 
              required 
              minLength={6}
            />
          </div>
          
          <button 
            type="submit" 
            style={{
              width: '100%',
              backgroundColor: '#10B981', // quest-emerald
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '1rem',
              padding: '0.625rem 1rem',
              marginTop: '0.5rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
            disabled={loading}
          >
            {loading ? 'Подождите...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
          
          <div className="text-center mt-4">
            <button 
              type="button" 
              onClick={toggleMode}
              className="text-sm text-quest-blue hover:underline cursor-pointer"
            >
              {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
            </button>
          </div>
        </form>
        
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">или продолжить с</span>
          </div>
        </div>

        <GoogleAuthButton 
          className="w-full mt-6" 
          onError={setError}
          onSuccess={onClose}
        />
        
        <p className="text-xs text-gray-500 mt-6 text-center">
          Нажимая "{isLogin ? 'Войти' : 'Зарегистрироваться'}", вы принимаете наши <a href="/privacy" className="underline hover:text-quest-blue">Условия использования</a>.
        </p>
      </div>
    </div>
  );
};
