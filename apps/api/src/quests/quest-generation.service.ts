import { Injectable, Logger } from '@nestjs/common';
import { OpenAiService } from '../openai/openai.service';
import { QuestsRepository } from './quests.repository';
import { GenerateQuestDto } from './dto';
import { IGeneratedQuestData } from '../interfaces/quest.interfaces';

/**
 * @class QuestGenerationService
 * @description Сервис, отвечающий за генерацию квестов с использованием AI.
 * Он обрабатывает запросы на генерацию, взаимодействует с OpenAiService,
 * валидирует результат и сохраняет его с помощью QuestsRepository.
 */
@Injectable()
export class QuestGenerationService {
  private readonly logger = new Logger(QuestGenerationService.name);

  constructor(
    private readonly openAiService: OpenAiService,
    private readonly questsRepository: QuestsRepository,
  ) {}

  /**
   * Генерирует новый квест на основе описания пользователя.
   * @param {GenerateQuestDto} dto - Параметры для генерации (тема, сложность и т.д.).
   * @param {string} userId - ID пользователя, для которого генерируется квест.
   * @returns {Promise<IGeneratedQuestData>} Данные сгенерированного квеста.
   */
  async generateQuest(dto: GenerateQuestDto, userId: string): Promise<IGeneratedQuestData> {
    try {
      const { theme, difficulty, length } = dto;
      
      this.logger.log(`Generating quest for user ${userId} with theme: ${theme}`);

      const questContent = await this.openAiService.generateQuest({
        theme,
        complexity: difficulty,
        length,
      });
      
      this.logger.log(`Content generated for user ${userId}`);

      const validatedContent = this.validateQuestContent(questContent, theme);

      const newQuest = await this.questsRepository.create({
        title: validatedContent.title,
        description: validatedContent.description,
        content: validatedContent,
        isPublic: false,
      }, userId);

      this.logger.log(`New quest ${newQuest.id} created for user ${userId}`);

      return {
        id: newQuest.id,
        title: newQuest.title,
        description: newQuest.description,
        questType: validatedContent.questType,
        difficulty: validatedContent.difficulty,
        tasks: validatedContent.tasks,
        rewards: validatedContent.rewards,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error generating quest for user ${userId}: ${message}`, stack);
      throw error;
    }
  }

  /**
   * Валидирует контент, полученный от OpenAI, и приводит его к нужной структуре.
   * @param {any} content - Контент от OpenAI.
   * @param {string} defaultDescription - Описание, используемое по умолчанию.
   * @returns {any} Валидированный объект контента квеста.
   * @private
   */
  private validateQuestContent(content: any, defaultDescription: string): any {
    const validatedContent = {
      title: content.title || 'Новый квест',
      description: content.description || defaultDescription || '',
      questType: content.questType || 'adventure',
      difficulty: content.difficulty || 'normal',
      tasks: [],
      rewards: {
        xp: 100,
        itemName: 'Награда за квест'
      },
      ...content,
    };

    if (content.tasks && Array.isArray(content.tasks)) {
      validatedContent.tasks = content.tasks.map((task: any, index: number) => ({
        id: task.id || `task_${index + 1}`,
        title: task.title || 'Задача',
        description: task.description || '',
        completed: false,
        xp: task.xp || 10
      }));
    }
    
    return validatedContent;
  }
} 