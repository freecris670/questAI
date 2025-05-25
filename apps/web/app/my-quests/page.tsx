import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ChevronRight, FileText } from 'lucide-react';

// Временные данные для квестов
const questsData = [
  {
    id: '1',
    title: 'Разработать новую фичу для проекта X',
    description: 'Теги: #работа #срочно. 3 подзадачи',
    status: 'Активен' as const,
    progress: 60, // в процентах
    tasksCompleted: 3,
    tasksTotal: 5,
    createdAt: '24.05.2025',
  },
  {
    id: '2',
    title: 'Пройти курс по React Advanced',
    description: 'Теги: #обучение. 10 модулей',
    status: 'Завершен' as const,
    createdAt: '15.04.2025',
  },
  {
    id: '3',
    title: 'Написать статью о Next.js для корпоративного блога',
    description: 'Теги: #контент. Черновик. Задача на написание технической статьи.',
    status: 'Черновик' as const,
    createdAt: '20.05.2025',
  },
];

// const questsData: QuestCardProps[] = []; // Для теста пустого состояния

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
          <Link href={`/quests/${id}`} passHref> 
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
  return (
    <div className="min-h-screen bg-[#F7F9FB] py-5 px-4 md:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2553A1] mb-6">Мои квесты</h1>

        <Card className="mb-6 bg-white p-4 border border-[#E3E6EA] rounded-md">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="text" placeholder="Поиск по названию или тегам..." className="pl-10 border-[#E3E6EA] rounded-md w-full" />
            </div>
            <Select>
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
            <Select>
              <SelectTrigger className="w-full md:w-[220px] border-[#E3E6EA] rounded-md text-[#64748B]">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_new">По дате создания (новые)</SelectItem>
                <SelectItem value="date_old">По дате создания (старые)</SelectItem>
                <SelectItem value="name_asc">По названию (А-Я)</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-[#22B07D] text-white hover:bg-[#22B07D]/90 rounded-md w-full md:w-auto">
              Применить фильтры
            </Button>
          </div>
        </Card>

        {questsData.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-md border border-[#E3E6EA] p-6">
            <div className="flex justify-center mb-6">
                <FileText size={80} className="text-[#A0AEC0]" />
            </div>
            <p className="text-xl font-medium text-[#64748B] mb-4">У вас пока нет созданных квестов.</p>
            <Link href="/create-quest" passHref>
              <Button className="bg-[#22B07D] text-white hover:bg-[#22B07D]/90 rounded-md">
                Создать новый квест
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            {questsData.map((quest) => (
              <QuestCard key={quest.id} {...quest} />
            ))}
          </div>
        )}

        {questsData.length > 3 && (
          <div className="mt-8 flex justify-center items-center space-x-1 md:space-x-2 text-sm">
            <Button variant="outline" size="sm" disabled className="rounded-md">« Назад</Button>
            <Button variant="outline" size="sm" className="bg-[#2553A1]/10 border-[#2553A1] text-[#2553A1] rounded-md">1</Button>
            <Button variant="outline" size="sm" className="rounded-md">2</Button>
            <Button variant="outline" size="sm" className="rounded-md">3</Button>
            <Button variant="outline" size="sm" className="rounded-md">Вперед »</Button>
          </div>
        )}
      </div>
    </div>
  );
}
