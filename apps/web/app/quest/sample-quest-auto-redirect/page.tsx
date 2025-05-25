// /home/killen/Documents/questAI/apps/web/app/quest/sample-quest-auto-redirect/page.tsx
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';
import { Button } from '@/components/ui/button'; // Предполагаем, что Button есть в Shadcn UI
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface IQuestStep {
  id: string;
  title: string;
  description: string;
  type: 'text' | 'image_recognition' | 'geo_location'; // Примерные типы шагов
}

interface IQuestDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'легкий' | 'средний' | 'сложный';
  estimatedTime: string; // Например, "1 час 30 минут"
  rating: number; // от 1 до 5
  author: string;
  coverImageUrl?: string;
  steps: IQuestStep[];
}

// Примерные данные для квеста
const sampleQuestData: IQuestDetails = {
  id: 'sample-quest-auto-redirect',
  title: 'Пример автоматически сгенерированного квеста',
  description: 'Это описание для примера квеста, который был создан для демонстрации автоматического перехода после генерации. Он содержит несколько шагов различного типа.',
  category: 'Приключения',
  difficulty: 'средний',
  estimatedTime: '45 минут',
  rating: 4.5,
  author: 'AI Генератор Квестов',
  coverImageUrl: 'https://via.placeholder.com/800x400.png?text=Обложка+Квеста', // Заглушка для обложки
  steps: [
    { id: 'step1', title: 'Введение', description: 'Прочитайте внимательно описание квеста.', type: 'text' },
    { id: 'step2', title: 'Найди объект', description: 'Найдите красный круг на следующей картинке.', type: 'image_recognition' },
    { id: 'step3', title: 'Доберись до точки', description: 'Отправляйтесь по указанным координатам.', type: 'geo_location' },
    { id: 'step4', title: 'Завершение', description: 'Поздравляем! Вы прошли квест.', type: 'text' },
  ],
};

const QuestDetailPage = () => {
  // В реальном приложении здесь будет логика загрузки данных квеста по ID из URL
  const quest = sampleQuestData;

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

  return (
    <div className="min-h-screen bg-quest-bg-light flex flex-col">
      <MainHeader />
      <main className="flex-grow container mx-auto px-4 py-8 pt-24"> {/* pt-24 для отступа от MainHeader */}
        <div className="mb-6">
          <Link href="/quests" passHref>
            <Button variant="outline" className="text-quest-blue border-quest-blue hover:bg-quest-blue/10">
              <ArrowLeft size={18} className="mr-2" />
              Назад к списку квестов
            </Button>
          </Link>
        </div>

        {quest.coverImageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <img src={quest.coverImageUrl} alt={`Обложка квеста ${quest.title}`} className="w-full h-auto max-h-[400px] object-cover" />
          </div>
        )}

        <h1 className="text-4xl font-bold text-quest-blue mb-4">{quest.title}</h1>
        <p className="text-lg text-quest-gray-text mb-2">{quest.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8 text-sm">
          <div><span className="font-semibold text-quest-blue">Категория:</span> {quest.category}</div>
          <div><span className="font-semibold text-quest-blue">Сложность:</span> <span className="capitalize">{quest.difficulty}</span></div>
          <div><span className="font-semibold text-quest-blue">Примерное время:</span> {quest.estimatedTime}</div>
          <div><span className="font-semibold text-quest-blue">Рейтинг:</span> {quest.rating} / 5</div>
          <div><span className="font-semibold text-quest-blue">Автор:</span> {quest.author}</div>
        </div>

        <h2 className="text-2xl font-semibold text-quest-blue mb-6">Шаги квеста:</h2>
        <div className="space-y-6">
          {quest.steps.map((step, index) => (
            <div key={step.id} className="bg-white p-6 rounded-lg shadow-md border border-quest-gray-border">
              <h3 className="text-xl font-medium text-quest-blue mb-2">Шаг {index + 1}: {step.title}</h3>
              <p className="text-quest-gray-text mb-3">{step.description}</p>
              <p className="text-xs text-quest-blue-dark">Тип шага: <span className="font-semibold">{step.type.replace('_', ' ')}</span></p>
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
