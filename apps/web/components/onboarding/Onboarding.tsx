import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboardingStore } from '@/stores/onboarding';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Добро пожаловать в QuestAI!',
    description: 'Превращайте обычные задачи в увлекательные квесты с помощью искусственного интеллекта.',
    position: 'center',
  },
  {
    id: 'create-quest',
    title: 'Создавайте квесты',
    description: 'Опишите вашу задачу, и ИИ превратит её в увлекательный квест с наградами и достижениями.',
    position: 'top',
  },
  {
    id: 'track-progress',
    title: 'Отслеживайте прогресс',
    description: 'Следите за своим продвижением, получайте награды и делитесь достижениями с друзьями.',
    position: 'bottom',
  },
  {
    id: 'premium',
    title: 'Расширенные возможности',
    description: 'Получите доступ к дополнительным функциям и неограниченному количеству квестов.',
    position: 'right',
  },
];

export function Onboarding() {
  const { currentStep, setCurrentStep, isCompleted, completeOnboarding } = useOnboardingStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(((currentStep + 1) / steps.length) * 100);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  if (isCompleted) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-6 bg-white rounded-lg shadow-xl"
        >
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
            <p className="text-gray-600">{steps[currentStep].description}</p>
            
            <Progress value={progress} className="w-full" />
            
            <div className="flex justify-between items-center pt-4">
              <Button variant="ghost" onClick={handleSkip}>
                Пропустить
              </Button>
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? 'Завершить' : 'Далее'}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 