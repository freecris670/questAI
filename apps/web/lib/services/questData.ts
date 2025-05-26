import { QuestDetails } from '@/app/quest/types';
import sampleQuestData from '../data/sample-quest.json';

/**
 * Загружает данные квеста из JSON-файла
 * Имитирует получение данных с бэкенда
 */
export function loadSampleQuestData(): QuestDetails {
  return sampleQuestData as QuestDetails;
}

/**
 * Получает квест по ID из JSON-файла
 * Имитирует API-запрос к бэкенду
 */
export async function getSampleQuestById(id: string): Promise<QuestDetails> {
  // Имитация задержки загрузки с сервера
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Возвращаем данные из JSON-файла, но с запрошенным ID
  const questData = { ...loadSampleQuestData(), id };
  return questData;
}
