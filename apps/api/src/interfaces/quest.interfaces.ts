import { IUserStats } from './user.interfaces';

export interface IQuest {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO-формат даты
  isPublic: boolean;
  progress: number; // прогресс выполнения от 0 до 100
  questType: string;
}

export interface IQuestDetails extends IQuest {
  createdDays: number; // количество дней с момента создания
  stages: Array<{
    name: string;
    completed: boolean;
  }>;
  currentStage: number;
  activeTaskId: string;
  rewards: {
    xp: number;
    gold: number;
    itemName: string;
  };
  subtasks: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    xp: number;
    progress: number;
    reward?: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
  }>;
  stats: {
    completion: number;
    tasksCompleted: number;
    totalTasks: number;
    artifactsFound: number;
    totalArtifacts: number;
    xpEarned: number;
    totalXp: number;
    timeInvested: string;
  };
  user: IUserStats;
}

export interface IGeneratedQuestData {
  id: string;
  title: string;
  description: string;
  questType: string;
  difficulty: string;
  tasks: Array<{
    title: string;
    description: string;
  }>;
  rewards: {
    xp: number;
    itemName: string;
  };
}

export interface IQuestProgress {
  questProgress: number; // обновленный общий прогресс квеста (0-100)
  taskCompleted: boolean;
  xpEarned: number; // количество полученного опыта
}
