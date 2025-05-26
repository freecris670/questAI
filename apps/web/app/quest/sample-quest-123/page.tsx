"use client";

import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getQuestById } from '@/lib/services/quests';
import { QuestDetails } from '@/app/quest/types';
import { useParams } from 'next/navigation';

const QuestDetailPage = () => {
  const [quest, setQuest] = useState<QuestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const questId = Array.isArray(params.id) ? params.id[0] : params.id || 'sample-quest-123';
  
  useEffect(() => {
    const fetchQuest = async () => {
      try {
        const questData = await getQuestById(questId);
        setQuest(questData);
      } catch (error) {
        console.error('Ошибка при загрузке квеста:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuest();
  }, [questId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-quest-bg-light flex flex-col">
        <MainHeader />
        <div className="flex-grow flex items-center justify-center text-quest-blue">
          <p>Загрузка квеста...</p>
        </div>
        <MainFooter />
      </div>
    );
  }
  
  if (!quest) {
    return (
      <div className="min-h-screen bg-quest-bg-light flex flex-col">
        <MainHeader />
        <div className="flex-grow flex items-center justify-center text-quest-blue">
          <p>Квест не найден.</p>
        </div>
        <MainFooter />
      </div>
    );
  }
  
  // Создаем временные поля для отображения на странице
  const category = quest.questType || 'Приключение';
  const difficulty = quest.stats?.completion < 40 ? 'сложный' : quest.stats?.completion < 70 ? 'средний' : 'легкий';
  const estimatedTime = quest.stats?.timeInvested || '1 час 15 минут';
  const rating = quest.stats?.completion / 20 || 4.5; // Преобразуем прогресс в рейтинг по шкале от 0 до 5
  const author = quest.user?.name || 'AI Генератор Квестов';
  const coverImageUrl = `https://via.placeholder.com/800x400.png?text=${encodeURIComponent(quest.title.replace(/\s+/g, '+'))}`;

  return (
    <div className="min-h-screen bg-quest-bg-light flex flex-col">
      <MainHeader />
      <main className="flex-grow container mx-auto px-4 py-8 pt-24">
        <div className="mb-6">
          <Link href="/quests" passHref>
            <Button variant="outline" className="text-quest-blue border-quest-blue hover:bg-quest-blue/10">
              <ArrowLeft size={18} className="mr-2" />
              Назад к списку квестов
            </Button>
          </Link>
        </div>

        <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
          <img src={coverImageUrl} alt={`Обложка квеста ${quest.title}`} className="w-full h-auto max-h-[400px] object-cover" />
        </div>

        <h1 className="text-4xl font-bold text-quest-blue mb-4">{quest.title}</h1>
        <p className="text-lg text-quest-gray-text mb-2">{quest.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8 text-sm">
          <div><span className="font-semibold text-quest-blue">Категория:</span> {category}</div>
          <div><span className="font-semibold text-quest-blue">Сложность:</span> <span className="capitalize">{difficulty}</span></div>
          <div><span className="font-semibold text-quest-blue">Примерное время:</span> {estimatedTime}</div>
          <div><span className="font-semibold text-quest-blue">Рейтинг:</span> {rating.toFixed(1)} / 5</div>
          <div><span className="font-semibold text-quest-blue">Автор:</span> {author}</div>
        </div>

        <h2 className="text-2xl font-semibold text-quest-blue mb-6">Задачи квеста:</h2>
        <div className="space-y-6">
          {quest.subtasks.map((task, index) => (
            <div key={task.id} className="bg-white p-6 rounded-lg shadow-md border border-quest-gray-border">
              <h3 className="text-xl font-medium text-quest-blue mb-2">Задача {index + 1}: {task.title}</h3>
              <p className="text-quest-gray-text mb-3">{task.description}</p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-quest-blue-dark">Прогресс: <span className="font-semibold">{task.progress}%</span></p>
                <p className="text-xs text-quest-emerald">Награда: <span className="font-semibold">{task.reward}</span></p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" className="bg-quest-emerald hover:bg-quest-emerald/90 text-white">
            Начать квест
          </Button>
        </div>
      </main>
      <MainFooter />
    </div>
  );
};

export default QuestDetailPage;
