"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ChevronRight, FileText } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';
import { Spinner } from '@/components/ui/spinner';
import { useQuests } from '@/lib/hooks/useQuests';
import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';

interface QuestCardProps {
  id: string;
  title: string;
  description: string;
  status: 'Активен' | 'Завершен' | 'Черновик';
  progress?: number;
  tasksCompleted?: number;
  tasksTotal?: number;
  createdAt: string;
}

const QuestCard: React.FC<QuestCardProps> = ({ id, title, description, status, progress, tasksCompleted, tasksTotal, createdAt }) => {
  let statusBgColor = '';
  let statusTextColor = '';

  switch (status) {
    case 'Активен':
      statusBgColor = 'bg-[#22B07D]'; // изумрудный
      statusTextColor = 'text-white';
      break;
    case 'Завершен':
      statusBgColor = 'bg-[#2553A1]'; // синий
      statusTextColor = 'text-white';
      break;
    case 'Черновик':
      statusBgColor = 'bg-[#E3E6EA]'; // серый
      statusTextColor = 'text-[#64748B]'; // темный текст
      break;
  }

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow duration-200 bg-white border border-[#E3E6EA] rounded-md">
      <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex-grow mb-4 md:mb-0 md:mr-4 min-w-0">
          <h3 className="text-xl font-medium text-[#2553A1] truncate" title={title}>{title}</h3>
          <p className="text-sm text-[#64748B] mt-1 truncate" title={description}>{description}</p>
        </div>
        <div className="flex-shrink-0 flex flex-col items-start md:items-end w-full md:w-auto md:max-w-[220px]">
          <div className={`px-2 py-0.5 text-xs rounded-full ${statusBgColor} ${statusTextColor} mb-2 self-start md:self-end`}>
            {status}
          </div>
          {status === 'Активен' && progress !== undefined && tasksCompleted !== undefined && tasksTotal !== undefined && (
            <div className="w-full md:w-[100px] mb-2">
              <div className="h-1.5 w-full bg-[#E3E6EA] rounded-full overflow-hidden">
                <div className="h-1.5 bg-[#22B07D] rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-xs text-[#64748B] mt-1 text-right md:text-left">{`${tasksCompleted}/${tasksTotal} задач`}</p>
            </div>
          )}
          <p className="text-xs text-[#A0AEC0] mb-3">Создан: {createdAt}</p>
          <Link href={`/quest/${id}`} passHref> 
            <Button variant="outline" size="sm" className="border-[#2553A1] text-[#2553A1] hover:bg-[#2553A1]/10 rounded-md">
              Подробнее <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MyQuestsPage() {
  const { user } = useAuth();
  // Получаем квесты без передачи userId для неавторизованных пользователей
  // или с userId для авторизованных
  const { data: quests, isLoading, error } = useQuests(user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_new');

  // Преобразуем данные квестов в формат для отображения
  const transformQuest = (quest: {
    id: string;
    title: string;
    description?: string;
    tasks?: Array<{completed?: boolean}>;
    created_at: string;
  }): QuestCardProps => {
    const tasks = quest.tasks || [];
    const completedTasks = tasks.filter((task: {completed?: boolean}) => task.completed).length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Форматируем дату
    const createdDate = new Date(quest.created_at);
    const formattedDate = createdDate.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return {
      id: quest.id,
      title: quest.title,
      description: quest.description || 'Описание квеста',
      status: progress === 100 ? 'Завершен' : 'Активен',
      progress: Math.round(progress),
      tasksCompleted: completedTasks,
      tasksTotal: totalTasks,
      createdAt: formattedDate
    };
  };

  // Фильтрация и сортировка квестов
  const filteredQuests = quests ? quests
    .map(transformQuest)
    .filter((quest: QuestCardProps) => {
      const matchesSearch = quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           quest.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && quest.status === 'Активен') ||
                           (statusFilter === 'completed' && quest.status === 'Завершен') ||
                           (statusFilter === 'drafts' && quest.status === 'Черновик');
      return matchesSearch && matchesStatus;
    })
    .sort((a: QuestCardProps, b: QuestCardProps) => {
      switch (sortBy) {
        case 'date_new':
          return new Date(b.createdAt.split('.').reverse().join('-')).getTime() - 
                 new Date(a.createdAt.split('.').reverse().join('-')).getTime();
        case 'date_old':
          return new Date(a.createdAt.split('.').reverse().join('-')).getTime() - 
                 new Date(b.createdAt.split('.').reverse().join('-')).getTime();
        case 'name_asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    }) : [];

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F7F9FB]">
        <MainHeader />
        <main className="flex-grow container mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8 py-5 pt-20">
          <div className="flex items-center justify-center py-20">
            <Spinner className="w-12 h-12 text-[#2553A1]" />
          </div>
        </main>
        <MainFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F7F9FB]">
        <MainHeader />
        <main className="flex-grow container mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8 py-5 pt-20">
          <div className="text-center py-20">
            <p className="text-xl text-red-600 mb-4">Ошибка загрузки квестов</p>
            <Button onClick={() => window.location.reload()} className="bg-[#22B07D] text-white hover:bg-[#22B07D]/90 rounded-md">
              Попробовать снова
            </Button>
          </div>
        </main>
        <MainFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB]">
      <MainHeader />
      <main className="flex-grow container mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8 py-5 pt-20">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2553A1] mb-6">Мои квесты</h1>

        <Card className="mb-6 bg-white p-4 border border-[#E3E6EA] rounded-md">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Поиск по названию или описанию..." 
                className="pl-10 border-[#E3E6EA] rounded-md w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] border-[#E3E6EA] rounded-md text-[#64748B]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="completed">Завершенные</SelectItem>
                <SelectItem value="drafts">Черновики</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[220px] border-[#E3E6EA] rounded-md text-[#64748B]">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_new">По дате создания (новые)</SelectItem>
                <SelectItem value="date_old">По дате создания (старые)</SelectItem>
                <SelectItem value="name_asc">По названию (А-Я)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {filteredQuests.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-md border border-[#E3E6EA] p-6">
            <div className="flex justify-center mb-6">
                <FileText size={80} className="text-[#A0AEC0]" />
            </div>
            <p className="text-xl font-medium text-[#64748B] mb-4">
              {quests && quests.length > 0 ? 'Квесты не найдены по заданным фильтрам.' : 'У вас пока нет созданных квестов.'}
            </p>
            <Link href="/" passHref>
              <Button className="bg-[#22B07D] text-white hover:bg-[#22B07D]/90 rounded-md">
                Создать новый квест
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            {filteredQuests.map((quest: QuestCardProps) => (
              <QuestCard key={quest.id} {...quest} />
            ))}
          </div>
        )}
      </main>
      <MainFooter />
    </div>
  );
}
