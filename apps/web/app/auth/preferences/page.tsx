"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';
import { supabase } from '@/lib/supabase';

// Типы для предпочтений пользователя
interface UserPreferences {
  questStyle: string;
  difficulty: string;
  motivation: string;
  purpose: string;
  step: number;
}

export default function PreferencesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>({
    questStyle: '',
    difficulty: '',
    motivation: '',
    purpose: '',
    step: 1,
  });

  // Получение данных текущего пользователя
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.error('Ошибка получения сессии:', error);
        router.push('/auth');
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  // Функция обновления предпочтений
  const updatePreference = (key: keyof UserPreferences, value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Функция перехода к следующему шагу
  const nextStep = () => {
    if (preferences.step < 4) {
      setPreferences((prev) => ({
        ...prev,
        step: prev.step + 1,
      }));
    } else {
      savePreferencesAndContinue();
    }
  };

  // Функция перехода к предыдущему шагу
  const prevStep = () => {
    if (preferences.step > 1) {
      setPreferences((prev) => ({
        ...prev,
        step: prev.step - 1,
      }));
    }
  };

  // Сохранение предпочтений в базу данных и переход к следующему экрану
  const savePreferencesAndContinue = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Сохранение предпочтений пользователя в профиль
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          preferences: {
            questStyle: preferences.questStyle,
            difficulty: preferences.difficulty,
            motivation: preferences.motivation,
            purpose: preferences.purpose,
          },
          // Пока не завершаем onboarding, так как нужно еще создать персонажа
          completed_onboarding: false, 
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      // Переход к странице создания профиля
      router.push('/auth/profile');
    } catch (error) {
      console.error('Ошибка сохранения предпочтений:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (preferences.step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2553A1] text-center">
              Выберите предпочитаемый стиль квестов
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'fantasy', name: 'Фэнтези', icon: '🧙‍♂️', description: 'Магия, приключения, герои и злодеи в волшебных мирах' },
                { id: 'scifi', name: 'Научная фантастика', icon: '🚀', description: 'Технологии будущего, космические путешествия и инопланетяне' },
                { id: 'realism', name: 'Реализм', icon: '🏙️', description: 'Реалистичные истории, основанные на повседневной жизни' },
              ].map((style) => (
                <Card 
                  key={style.id}
                  className={`cursor-pointer transition-all ${
                    preferences.questStyle === style.id 
                      ? 'border-[#2553A1] shadow-md ring-2 ring-[#2553A1]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updatePreference('questStyle', style.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{style.icon}</div>
                    <h3 className="text-lg font-medium mb-2">{style.name}</h3>
                    <p className="text-sm text-gray-600">{style.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2553A1] text-center">
              Какая сложность вам интересна?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'beginner', name: 'Новичок', icon: '🌱', description: 'Простые задания, подходящие для начинающих' },
                { id: 'adventurer', name: 'Искатель приключений', icon: '⚔️', description: 'Задачи средней сложности с интересными вызовами' },
                { id: 'heroic', name: 'Героический режим', icon: '👑', description: 'Сложные задачи для настоящих героев' },
              ].map((difficulty) => (
                <Card 
                  key={difficulty.id}
                  className={`cursor-pointer transition-all ${
                    preferences.difficulty === difficulty.id 
                      ? 'border-[#2553A1] shadow-md ring-2 ring-[#2553A1]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updatePreference('difficulty', difficulty.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{difficulty.icon}</div>
                    <h3 className="text-lg font-medium mb-2">{difficulty.name}</h3>
                    <p className="text-sm text-gray-600">{difficulty.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2553A1] text-center">
              Что вас мотивирует?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'achievements', name: 'Достижения', icon: '🏆', description: 'Коллекционирование наград и достижений' },
                { id: 'progress', name: 'Прогресс', icon: '📈', description: 'Видеть свой рост и развитие со временем' },
                { id: 'competition', name: 'Соревнование', icon: '🥇', description: 'Соревноваться с другими и стремиться к лидерству' },
              ].map((motivation) => (
                <Card 
                  key={motivation.id}
                  className={`cursor-pointer transition-all ${
                    preferences.motivation === motivation.id 
                      ? 'border-[#2553A1] shadow-md ring-2 ring-[#2553A1]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updatePreference('motivation', motivation.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{motivation.icon}</div>
                    <h3 className="text-lg font-medium mb-2">{motivation.name}</h3>
                    <p className="text-sm text-gray-600">{motivation.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2553A1] text-center">
              Для каких задач вы планируете использовать QuestAI?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'work', name: 'Работа', icon: '💼', description: 'Рабочие задачи и проекты' },
                { id: 'study', name: 'Учеба', icon: '📚', description: 'Образовательные цели и самообучение' },
                { id: 'personal', name: 'Личные проекты', icon: '🏡', description: 'Хобби, саморазвитие и домашние дела' },
              ].map((purpose) => (
                <Card 
                  key={purpose.id}
                  className={`cursor-pointer transition-all ${
                    preferences.purpose === purpose.id 
                      ? 'border-[#2553A1] shadow-md ring-2 ring-[#2553A1]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updatePreference('purpose', purpose.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{purpose.icon}</div>
                    <h3 className="text-lg font-medium mb-2">{purpose.name}</h3>
                    <p className="text-sm text-gray-600">{purpose.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2553A1]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col">
      <MainHeader />
      <main className="flex-grow container mx-auto max-w-4xl px-4 py-8 pt-24">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
          <div className="mb-8">
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-[#22B07D] rounded-full transition-all duration-300"
                style={{ width: `${(preferences.step / 4) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Шаг {preferences.step} из 4</span>
              <span>{Math.round((preferences.step / 4) * 100)}%</span>
            </div>
          </div>

          {renderStepContent()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={preferences.step === 1}
              className="px-6"
            >
              Назад
            </Button>

            <Button
              onClick={nextStep}
              disabled={
                (preferences.step === 1 && !preferences.questStyle) ||
                (preferences.step === 2 && !preferences.difficulty) ||
                (preferences.step === 3 && !preferences.motivation) ||
                (preferences.step === 4 && !preferences.purpose) ||
                loading
              }
              className="bg-[#22B07D] hover:bg-[#22B07D]/90 text-white px-6"
            >
              {preferences.step < 4 ? 'Далее' : 'Завершить'}
            </Button>
          </div>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
