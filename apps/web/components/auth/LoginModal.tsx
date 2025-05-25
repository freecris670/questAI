"use client";

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input'; // Assuming you have an Input component from Shadcn/ui
import { X } from 'lucide-react'; // For the close icon

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-semibold text-quest-blue mb-6 text-center">Вход в QuestAI</h2>
        
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input type="email" id="email" placeholder="you@example.com" className="w-full" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <Input type="password" id="password" placeholder="••••••••" className="w-full" />
          </div>
          <Button type="submit" className="w-full bg-quest-emerald hover:bg-quest-emerald/90 text-white">
            Войти
          </Button>
        </form>
        
        <p className="text-xs text-gray-500 mt-6 text-center">
          Нажимая "Войти", вы принимаете наши <a href="/privacy" className="underline hover:text-quest-blue">Условия использования</a>.
        </p>
      </div>
    </div>
  );
};
