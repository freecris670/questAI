import { QuestDetails } from '../types';

/**
 * Моковые данные квеста для отображения на странице
 */
export const questDetails: QuestDetails = {
  id: '1',
  title: 'Забытые Артефакты',
  questType: 'Эпический квест',
  createdDays: 5,
  description: 'Отправьтесь в путешествие, чтобы найти пять утерянных артефактов древней цивилизации. Проходите через сложные испытания и решайте запутанные головоломки, чтобы собрать все части до наступления полнолуния.',
  progress: 40, 
  stages: [
    { name: 'Старт', completed: true },
    { name: 'Первый артефакт', completed: true },
    { name: 'Второй артефакт', completed: false },
    { name: 'Третий артефакт', completed: false },
    { name: 'Завершение', completed: false },
  ],
  currentStage: 2,
  activeTaskId: 'sub3',
  rewards: {
    xp: 1500,
    gold: 250,
    itemName: 'Древний меч'
  },
  subtasks: [
    { id: 'sub1', title: 'Расшифровать древнюю карту', description: 'Проанализировать символы и определить местонахождение первого артефакта.', completed: true, xp: 100, progress: 100, reward: '+100 XP' },
    { id: 'sub2', title: 'Вернуть Кристальный Осколок', description: 'Пройти через Кристальную Пещеру, чтобы найти первый артефакт.', completed: true, xp: 250, progress: 100, reward: '+250 XP' },
    { id: 'sub3', title: 'Найти Древний Медальон', description: 'Исследовать Забытый Храм и решить головоломку, чтобы получить второй артефакт.', completed: false, xp: 300, progress: 75, reward: '+300 XP' },
    { id: 'sub4', title: 'Забрать Золотую Чашу', description: 'Смело преодолеть опасности Затонувшего Дворца, чтобы забрать третий артефакт.', completed: false, xp: 350, progress: 0, reward: '+350 XP' },
    { id: 'sub5', title: 'Обезопасить Древний Манускрипт', description: 'Проникнуть в Великую Библиотеку и найти четвертый артефакт.', completed: false, xp: 400, progress: 0, reward: '+400 XP' },
    { id: 'sub6', title: 'Найти Утерянную Корону', description: 'Взобраться на Туманные Пики, чтобы найти последний артефакт.', completed: false, xp: 500, progress: 0, reward: '+500 XP' },
  ],
  achievements: [
    { id: 'ach1', title: 'Картограф', description: 'Расшифровать древнюю карту', unlocked: true },
    { id: 'ach2', title: 'Охотник за сокровищами', description: 'Найти первый артефакт', unlocked: true },
    { id: 'ach3', title: 'Мастер головоломок', description: 'Решить три сложные головоломки', unlocked: true },
    { id: 'ach4', title: 'Исследователь', description: 'Исследовать все локации', unlocked: false },
    { id: 'ach5', title: 'Археолог', description: 'Найти все артефакты', unlocked: false },
    { id: 'ach6', title: 'Коллекционер', description: 'Собрать полную коллекцию древних реликвий', unlocked: false },
  ],
  stats: {
    completion: 40,
    tasksCompleted: 2,
    totalTasks: 6,
    artifactsFound: 2,
    totalArtifacts: 5,
    xpEarned: 350,
    totalXp: 1500,
    timeInvested: '2ч 45м',
  },
  user: {
    level: 42,
    levelProgress: 80,
    xpNeeded: 3750,
    name: 'Eldritch Ranger',
    questsCreated: 12,
    questsCompleted: 8,
    successRate: 67,
  }
};
