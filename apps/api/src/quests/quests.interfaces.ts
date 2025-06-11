/**
 * Интерфейс для содержимого квеста
 */
export interface QuestContent {
  title: string;
  description: string;
  // Другие возможные поля контента квеста
  scenes?: Array<unknown>;
  characters?: Array<unknown>;
  items?: Array<unknown>;
  [key: string]: unknown;
}

/**
 * DTO для создания квеста
 */
export interface CreateQuestDto {
  title: string;
  description: string;
  content: QuestContent;
  user_id: string;
  is_public?: boolean;
}

/**
 * DTO для обновления квеста
 */
export interface UpdateQuestDto {
  title?: string;
  description?: string;
  content?: QuestContent;
  is_public?: boolean;
}

/**
 * DTO для генерации квеста
 */
export interface GenerateQuestDto {
  theme: string;
  complexity: 'easy' | 'medium' | 'hard';
  length: 'short' | 'medium' | 'long';
  userId: string;
}

export interface IQuest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  // ... existing code ...
}
