import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  currentStep: number;
  isCompleted: boolean;
  setCurrentStep: (step: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      isCompleted: false,
      setCurrentStep: (step) => set({ currentStep: step }),
      completeOnboarding: () => set({ isCompleted: true }),
      resetOnboarding: () => set({ currentStep: 0, isCompleted: false }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
); 