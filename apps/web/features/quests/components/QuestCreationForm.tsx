"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function QuestCreationForm() {
  const router = useRouter();
  const [questDescription, setQuestDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateQuest = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      if (questDescription.length > 1500) {
        console.error('Слишком длинное описание квеста');
        setIsLoading(false);
        return;
      }
      
      const params = new URLSearchParams({ description: questDescription });
      router.push(`/quest/generating?${params.toString()}`);
    } catch (error) {
      console.error('Ошибка при переходе на страницу генерации:', error);
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-12 md:mb-16">
      <div className="bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-6 md:p-8 rounded-lg max-w-2xl mx-auto">
        <Textarea
          placeholder="Опишите ваш квест..."
          className="h-[120px] border-[#E3E6EA] rounded-md focus:border-[#2553A1] resize-none w-full p-3 text-base"
          value={questDescription}
          onChange={(e) => setQuestDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === 'Enter' && questDescription.trim()) {
              e.preventDefault();
              handleCreateQuest();
            }
          }}
        />
        <Button 
          onClick={handleCreateQuest}
          className="w-full h-[48px] bg-[#22B07D] hover:bg-[#22B07D]/90 text-white font-medium text-base rounded-md mt-6"
          disabled={isLoading || !questDescription.trim()}
        >
          {isLoading ? 'Создание...' : 'Создать квест'}
        </Button>
      </div>
    </section>
  );
} 