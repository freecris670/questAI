"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Trophy, Sparkles, Gift, Crown, Star, Zap, Shield, Gem } from 'lucide-react';

interface TrialLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  questsCreated?: number; // Количество созданных квестов
  maxTrialQuests?: number; // Максимальное количество квестов в пробном режиме
}

export function TrialLimitModal({ isOpen, onClose, questsCreated = 5 }: TrialLimitModalProps) {
  const router = useRouter();

  const handleRegister = () => {
    router.push('/auth');
    onClose();
  };

  const handleContinue = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden p-0">
        {/* Красивый градиентный заголовок */}
        <div className="bg-gradient-to-br from-[#2553A1] via-[#3B82F6] to-[#22B07D] p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Trophy className="w-16 h-16" />
              <Sparkles className="w-6 h-6 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-white">
              Поздравляем! Вы создали {questsCreated || 5} {questsCreated === 1 ? 'квест' : 'квеста'}!
            </DialogTitle>
            <DialogDescription className="text-center text-white/90 mt-2">
              Вы отлично освоились с QuestAI! Готовы раскрыть весь потенциал платформы?
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          {/* Преимущества регистрации */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-[#22B07D]" />
              Что вас ждет после регистрации:
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22B07D] to-[#1FA268] flex items-center justify-center flex-shrink-0">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Безлимитное создание квестов</p>
                  <p className="text-sm text-gray-600">Создавайте столько квестов, сколько захотите</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#F97316] flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Сохранение прогресса</p>
                  <p className="text-sm text-gray-600">Все ваши квесты и достижения в одном месте</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Продвинутые функции</p>
                  <p className="text-sm text-gray-600">Кастомизация, командные квесты и многое другое</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2553A1] to-[#1E40AF] flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Эксклюзивные награды</p>
                  <p className="text-sm text-gray-600">Уникальные достижения и бонусы для участников</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Специальное предложение */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 mb-6 border border-amber-200">
            <div className="flex items-center space-x-2 mb-1">
              <Gem className="w-5 h-5 text-amber-600" />
              <p className="font-semibold text-amber-800">Специальное предложение!</p>
            </div>
            <p className="text-sm text-amber-700">
              Зарегистрируйтесь сейчас и получите <span className="font-bold">500 бонусных XP</span> для старта!
            </p>
          </div>
          
          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleRegister}
              className="flex-1 bg-gradient-to-r from-[#22B07D] to-[#1FA268] hover:from-[#1FA268] hover:to-[#1C8F5A] text-white font-medium shadow-lg"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Начать приключение
            </Button>
            <Button 
              onClick={handleContinue}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Продолжить без регистрации
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Регистрация бесплатна и занимает меньше минуты
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
