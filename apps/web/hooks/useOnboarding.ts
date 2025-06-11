import { useEffect, useRef } from 'react';
import { useOnboardingStore } from '@/stores/onboarding';

export function useOnboarding() {
  const { currentStep, isCompleted, setCurrentStep, completeOnboarding } = useOnboardingStore();
  const tooltipRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Аналитика: отслеживание начала онбординга
    if (currentStep === 0 && !isCompleted) {
      // Здесь можно добавить отправку события в аналитику
      console.log('Onboarding started');
    }

    // Аналитика: отслеживание завершения онбординга
    if (isCompleted) {
      // Здесь можно добавить отправку события в аналитику
      console.log('Onboarding completed');
    }
  }, [currentStep, isCompleted]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  return {
    currentStep,
    isCompleted,
    tooltipRef,
    handleNext,
    handleSkip,
  };
} 