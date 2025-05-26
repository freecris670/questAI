/**
 * Тип для этапа квеста
 */
export interface QuestStage {
  name: string;
  completed: boolean;
}

/**
 * Тип для наград квеста
 */
export interface QuestRewards {
  xp: number;
  gold: number;
  itemName: string;
}

/**
 * Тип для задачи квеста
 */
export interface QuestTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  xp: number;
  progress: number;
  reward?: string;
}

/**
 * Тип для достижения квеста
 */
export interface QuestAchievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

/**
 * Тип для статистики квеста
 */
export interface QuestStats {
  completion: number;
  tasksCompleted: number;
  totalTasks: number;
  artifactsFound: number;
  totalArtifacts: number;
  xpEarned: number;
  totalXp: number;
  timeInvested: string;
}

/**
 * Тип для статистики пользователя
 */
export interface UserStats {
  level: number;
  levelProgress: number;
  xpNeeded: number;
  name: string;
  questsCreated: number;
  questsCompleted: number;
  successRate: number;
}

/**
 * Тип для полных данных квеста
 */
export interface QuestDetails {
  id: string;
  title: string;
  questType: string;
  createdDays: number;
  description: string;
  progress: number;
  stages: QuestStage[];
  currentStage: number;
  activeTaskId: string;
  rewards: QuestRewards;
  subtasks: QuestTask[];
  achievements: QuestAchievement[];
  stats: QuestStats;
  user: UserStats;
}
