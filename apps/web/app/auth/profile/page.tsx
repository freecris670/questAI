"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';
import { supabase } from '@/lib/supabase';
import { Loader2, Dices } from 'lucide-react';

// Массив доступных аватаров
const avatars = [
  { id: 'warrior', src: '/avatars/warrior.png', label: 'Воин' },
  { id: 'mage', src: '/avatars/mage.png', label: 'Маг' },
  { id: 'rogue', src: '/avatars/rogue.png', label: 'Разбойник' },
  { id: 'ranger', src: '/avatars/ranger.png', label: 'Следопыт' },
  { id: 'paladin', src: '/avatars/paladin.png', label: 'Паладин' },
  { id: 'bard', src: '/avatars/bard.png', label: 'Бард' },
];

// Массив примеров имен персонажей для случайной генерации
const characterNames = [
  'Альтаир', 'Бриенна', 'Валеран', 'Грогнак', 'Дариан',
  'Елена', 'Жорж', 'Зельда', 'Иллидан', 'Каэль',
  'Лирой', 'Мерлин', 'Нова', 'Ориана', 'Пайк',
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      
      // Проверяем, есть ли уже данные профиля
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url, character_name')
        .eq('id', session.user.id)
        .single();
        
      if (profile) {
        if (profile.avatar_url) setSelectedAvatar(profile.avatar_url);
        if (profile.character_name) setCharacterName(profile.character_name);
      }
    };

    fetchUser();
  }, [router]);

  // Генерация случайного имени персонажа
  const generateRandomName = () => {
    const randomIndex = Math.floor(Math.random() * characterNames.length);
    setCharacterName(characterNames[randomIndex]);
  };

  // Сохранение профиля и завершение онбординга
  const saveProfileAndContinue = async () => {
    if (!user) return;
    if (!selectedAvatar) {
      setError('Пожалуйста, выберите аватар');
      return;
    }
    if (!characterName.trim()) {
      setError('Пожалуйста, введите имя персонажа');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      // Сохранение профиля пользователя
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: selectedAvatar,
          character_name: characterName.trim(),
          completed_onboarding: true,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      // Создание начальной статистики для пользователя, если еще не создана
      const { error: statsError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          level: 1,
          xp: 0,
          quests_completed: 0,
          quests_created: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (statsError) throw statsError;
      
      // Переход к квестам после завершения создания профиля
      router.push('/my-quests');
    } catch (error: unknown) {
      console.error('Ошибка сохранения профиля:', error);
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при сохранении профиля';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB] dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2553A1] dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] dark:bg-gray-900 flex flex-col">
      <MainHeader />
      <main className="flex-grow container mx-auto max-w-4xl px-4 py-8 pt-24">
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-semibold text-[#2553A1] dark:text-blue-400 text-center mb-8">
            Создайте своего персонажа
          </h1>
          
          <div className="space-y-8">
            {/* Выбор аватара */}
            <div>
              <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">
                Выберите аватар
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {avatars.map((avatar) => (
                  <Card 
                    key={avatar.id}
                    className={`cursor-pointer transition-all ${
                      selectedAvatar === avatar.id 
                        ? 'border-[#2553A1] dark:border-blue-500 shadow-md ring-2 ring-[#2553A1] dark:ring-blue-500' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedAvatar(avatar.id)}
                  >
                    <CardContent className="p-4 flex flex-col items-center">
                      <div className="relative w-16 h-16 mb-2">
                        <div className="rounded-full bg-gray-200 dark:bg-gray-700 w-full h-full flex items-center justify-center overflow-hidden">
                          <Image 
                            src={`/avatars/${avatar.id}.svg`}
                            alt={avatar.label}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-center">{avatar.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Ввод имени персонажа */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="character-name" className="text-xl font-medium text-gray-800 dark:text-gray-200">
                  Имя персонажа
                </Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={generateRandomName}
                  className="flex items-center gap-1"
                >
                  <Dices className="w-4 h-4" />
                  <span>Сгенерировать</span>
                </Button>
              </div>
              <Input
                id="character-name"
                placeholder="Введите имя вашего персонажа"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Имя персонажа будет отображаться в профиле и лидерборде
              </p>
            </div>
            
            {/* Сообщение об ошибке */}
            {error && (
              <p className="text-red-500 dark:text-red-400 text-sm">
                {error}
              </p>
            )}
            
            {/* Кнопка сохранения */}
            <div className="flex justify-center mt-6">
              <Button
                onClick={saveProfileAndContinue}
                disabled={saving || !selectedAvatar || !characterName.trim()}
                className="bg-[#22B07D] hover:bg-[#22B07D]/90 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-8 py-2 text-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  'Начать приключение'
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
