import { v4 as uuidv4 } from 'uuid';
import { QuestDetails, QuestStage, QuestTask, QuestAchievement, QuestStats, UserStats, QuestRewards } from '@/app/quest/types';

// Функция для генерации случайных задач квеста
function generateRandomTasks(count: number): QuestTask[] {
  const taskTitles = [
    'Расшифровать древнюю карту',
    'Вернуть Кристальный Осколок',
    'Найти Древний Медальон',
    'Забрать Золотую Чашу',
    'Обезопасить Древний Манускрипт',
    'Найти Утерянную Корону',
    'Исследовать Забытые Руины',
    'Разгадать Тайну Древнего Храма',
    'Собрать Части Амулета',
    'Восстановить Древний Артефакт',
    'Найти Потерянный Город',
    'Победить Хранителя Сокровищ'
  ];
  
  const taskDescriptions = [
    'Проанализировать символы и определить местонахождение первого артефакта.',
    'Пройти через Кристальную Пещеру, чтобы найти первый артефакт.',
    'Исследовать Забытый Храм и решить головоломку, чтобы получить второй артефакт.',
    'Смело преодолеть опасности Затонувшего Дворца, чтобы забрать третий артефакт.',
    'Проникнуть в Великую Библиотеку и найти четвертый артефакт.',
    'Взобраться на Туманные Пики, чтобы найти последний артефакт.',
    'Пройти через зачарованный лес и найти древние руины.',
    'Разгадать загадки храма, чтобы открыть тайную комнату.',
    'Найти все части древнего амулета, разбросанные по миру.',
    'Собрать и восстановить разрушенный артефакт силы.',
    'Следовать по древней карте к затерянному городу.',
    'Сразиться с древним стражем, охраняющим сокровища.'
  ];
  
  const tasks: QuestTask[] = [];
  const usedTitles: Set<number> = new Set();
  const usedDescriptions: Set<number> = new Set();
  
  for (let i = 0; i < count; i++) {
    let randomTitleIndex: number;
    let randomDescIndex: number;
    
    // Выбираем неиспользованный заголовок
    do {
      randomTitleIndex = Math.floor(Math.random() * taskTitles.length);
    } while (usedTitles.has(randomTitleIndex) && usedTitles.size < taskTitles.length);
    
    // Выбираем неиспользованное описание
    do {
      randomDescIndex = Math.floor(Math.random() * taskDescriptions.length);
    } while (usedDescriptions.has(randomDescIndex) && usedDescriptions.size < taskDescriptions.length);
    
    usedTitles.add(randomTitleIndex);
    usedDescriptions.add(randomDescIndex);
    
    const xp = 100 + (i * 50); // Увеличиваем XP с каждой задачей
    const completed = i < Math.floor(count / 3); // Первая треть задач выполнена
    const progress = completed ? 100 : (i < Math.floor(count / 2) ? 75 : 0); // Прогресс выполнения
    
    tasks.push({
      id: `sub${i+1}`,
      title: taskTitles[randomTitleIndex],
      description: taskDescriptions[randomDescIndex],
      completed,
      xp,
      progress,
      reward: `+${xp} XP`
    });
  }
  
  return tasks;
}

// Функция для генерации случайных достижений
function generateRandomAchievements(count: number): QuestAchievement[] {
  const achievementTitles = [
    'Картограф',
    'Охотник за сокровищами',
    'Мастер головоломок',
    'Исследователь',
    'Археолог',
    'Коллекционер',
    'Первооткрыватель',
    'Хранитель знаний',
    'Победитель стражей',
    'Мастер приключений'
  ];
  
  const achievementDescriptions = [
    'Расшифровать древнюю карту',
    'Найти первый артефакт',
    'Решить три сложные головоломки',
    'Исследовать все локации',
    'Найти все артефакты',
    'Собрать полную коллекцию древних реликвий',
    'Открыть новую неизведанную территорию',
    'Собрать все древние манускрипты',
    'Победить всех хранителей сокровищ',
    'Завершить десять квестов'
  ];
  
  const achievements: QuestAchievement[] = [];
  const usedTitles: Set<number> = new Set();
  const usedDescriptions: Set<number> = new Set();
  
  for (let i = 0; i < count; i++) {
    let randomTitleIndex: number;
    let randomDescIndex: number;
    
    // Выбираем неиспользованный заголовок
    do {
      randomTitleIndex = Math.floor(Math.random() * achievementTitles.length);
    } while (usedTitles.has(randomTitleIndex) && usedTitles.size < achievementTitles.length);
    
    // Выбираем неиспользованное описание
    do {
      randomDescIndex = Math.floor(Math.random() * achievementDescriptions.length);
    } while (usedDescriptions.has(randomDescIndex) && usedDescriptions.size < achievementDescriptions.length);
    
    usedTitles.add(randomTitleIndex);
    usedDescriptions.add(randomDescIndex);
    
    achievements.push({
      id: `ach${i+1}`,
      title: achievementTitles[randomTitleIndex],
      description: achievementDescriptions[randomDescIndex],
      unlocked: i < Math.floor(count / 2) // Половина достижений разблокирована
    });
  }
  
  return achievements;
}

// Функция для генерации случайных этапов квеста
function generateRandomStages(count: number): QuestStage[] {
  const stageNames = [
    'Старт',
    'Первый артефакт',
    'Второй артефакт',
    'Третий артефакт',
    'Четвертый артефакт',
    'Пятый артефакт',
    'Завершение'
  ];
  
  const stages: QuestStage[] = [];
  const currentStage = Math.floor(count / 3) + 1; // Текущий этап - примерно треть пути
  
  for (let i = 0; i < Math.min(count, stageNames.length); i++) {
    stages.push({
      name: stageNames[i],
      completed: i < currentStage
    });
  }
  
  return stages;
}

// Функция для генерации случайного квеста в формате динамической страницы
export function generateRandomQuest(): QuestDetails {
  const questTypes = ['Эпический квест', 'Ежедневный квест', 'Приключение', 'Исследование', 'Испытание'];
  const titles = [
    'Забытые Артефакты',
    'Тайны Древнего Храма',
    'Поиски Потерянного Города',
    'Легенда о Драконьем Камне',
    'Сокровища Затонувшего Корабля',
    'Загадки Старой Башни'
  ];
  const descriptions = [
    'Отправьтесь в путешествие, чтобы найти пять утерянных артефактов древней цивилизации. Проходите через сложные испытания и решайте запутанные головоломки, чтобы собрать все части до наступления полнолуния.',
    'Исследуйте древний храм, полный загадок и ловушек. Найдите священный артефакт, спрятанный глубоко в его недрах, и раскройте тайны давно забытой цивилизации.',
    'Следуйте по древней карте, чтобы найти легендарный затерянный город. Преодолевайте препятствия, решайте древние головоломки и откройте сокровища, которые никто не видел тысячелетиями.',
    'Отыщите фрагменты легендарного Драконьего Камня, разбросанные по всему миру. Соберите их вместе, чтобы раскрыть его истинную силу и предотвратить пробуждение древнего зла.',
    'Погрузитесь в глубины океана, чтобы исследовать затонувший корабль, полный сокровищ. Будьте осторожны, ведь древние проклятия все еще охраняют эти богатства от посторонних глаз.',
    'Поднимитесь на вершину Старой Башни, разгадывая загадки на каждом этаже. Только самые умные и смелые смогут достичь вершины и раскрыть тайну, спрятанную там веками.'
  ];
  
  const randomTypeIndex = Math.floor(Math.random() * questTypes.length);
  const randomTitleIndex = Math.floor(Math.random() * titles.length);
  const randomDescIndex = Math.floor(Math.random() * descriptions.length);
  
  const tasksCount = 4 + Math.floor(Math.random() * 3); // От 4 до 6 задач
  const achievementsCount = 4 + Math.floor(Math.random() * 3); // От 4 до 6 достижений
  const stagesCount = 3 + Math.floor(Math.random() * 3); // От 3 до 5 этапов
  
  const tasks = generateRandomTasks(tasksCount);
  const achievements = generateRandomAchievements(achievementsCount);
  const stages = generateRandomStages(stagesCount);
  const currentStage = Math.floor(stagesCount / 3) + 1; // Текущий этап - примерно треть пути
  
  // Расчет прогресса квеста
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalXp = tasks.reduce((sum, task) => sum + task.xp, 0);
  const earnedXp = tasks.filter(task => task.completed).reduce((sum, task) => sum + task.xp, 0);
  const progress = Math.round((completedTasks / tasksCount) * 100);
  
  // Создание статистики квеста
  const stats: QuestStats = {
    completion: progress,
    tasksCompleted: completedTasks,
    totalTasks: tasksCount,
    artifactsFound: completedTasks, // Предполагаем, что каждая задача - это артефакт
    totalArtifacts: tasksCount,
    xpEarned: earnedXp,
    totalXp: totalXp,
    timeInvested: `${Math.floor(Math.random() * 3) + 1}ч ${Math.floor(Math.random() * 60)}м`
  };
  
  // Создание наград квеста
  const rewards: QuestRewards = {
    xp: totalXp,
    gold: Math.floor(Math.random() * 300) + 100,
    itemName: ['Древний меч', 'Магический амулет', 'Книга заклинаний', 'Зачарованный щит', 'Мистический посох'][Math.floor(Math.random() * 5)]
  };
  
  // Создание статистики пользователя
  const user: UserStats = {
    level: Math.floor(Math.random() * 50) + 10,
    levelProgress: Math.floor(Math.random() * 100),
    xpNeeded: Math.floor(Math.random() * 5000) + 1000,
    name: ['Eldritch Ranger', 'Shadow Walker', 'Mystic Scholar', 'Dragon Slayer', 'Arcane Mage'][Math.floor(Math.random() * 5)],
    questsCreated: Math.floor(Math.random() * 20) + 5,
    questsCompleted: Math.floor(Math.random() * 15) + 3,
    successRate: Math.floor(Math.random() * 30) + 60
  };
  
  return {
    id: `quest-${uuidv4().slice(0, 8)}`,
    title: titles[randomTitleIndex],
    questType: questTypes[randomTypeIndex],
    createdDays: Math.floor(Math.random() * 10) + 1,
    description: descriptions[randomDescIndex],
    progress: progress,
    stages: stages,
    currentStage: currentStage,
    activeTaskId: tasks.find(task => !task.completed)?.id || 'sub1',
    rewards: rewards,
    subtasks: tasks,
    achievements: achievements,
    stats: stats,
    user: user
  };
}

// Функция для получения квеста по ID (для реального приложения здесь будет API-запрос)
export async function getQuestById(id: string): Promise<QuestDetails | null> {
  // В реальном приложении здесь будет запрос к API
  // Для демонстрации просто генерируем случайный квест
  const quest = generateRandomQuest();
  quest.id = id; // Устанавливаем запрошенный ID
  
  return quest;
}
