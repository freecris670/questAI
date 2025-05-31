import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService implements OnModuleInit {
  private openaiClient!: OpenAI;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('Отсутствует необходимая переменная окружения OPENAI_API_KEY');
    }

    this.openaiClient = new OpenAI({
      apiKey,
    });
  }

  get client(): OpenAI {
    return this.openaiClient;
  }
  
  /**
   * Генерирует контент для квеста на основе промпта
   * @param prompt Промпт для генерации контента
   * @returns JSON строка с сгенерированным контентом
   */
  async generateQuestContent(prompt: string): Promise<string> {
    try {
      const response = await this.openaiClient.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'Ты - генератор контента для геймифицированных квестов в стиле MMORPG. Создавай интересные задачи, этапы, достижения и награды, которые мотивируют пользователя выполнять реальные задачи. Ответы форматируй в виде JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Не удалось получить ответ от OpenAI');
      }

      return content;
    } catch (error) {
      console.error('Ошибка при генерации контента:', error);
      throw new Error('Не удалось сгенерировать контент');
    }
  }

  /**
   * Генерирует квест на основе заданных параметров
   */
  async generateQuest(params: {
    theme: string;
    complexity: 'easy' | 'medium' | 'hard';
    length: 'short' | 'medium' | 'long';
  }) {
    const { theme, complexity, length } = params;

    const prompt = `Создай геймифицированный квест в стиле MMORPG на тему "${theme}". 
    Сложность: ${complexity}. 
    Длина: ${length}.
    
    ВАЖНО: Весь контент должен быть ТОЛЬКО НА РУССКОМ ЯЗЫКЕ. Не создавай версии на английском.
    
    Формат ответа должен быть в JSON со следующей структурой:
    {
      "title": "Название квеста",
      "description": "Краткое описание квеста",
      "questType": "Тип квеста (например: adventure, learning, productivity, fitness)",
      "difficulty": "${complexity}",
      "tasks": [
        {
          "title": "Название задачи 1",
          "description": "Подробное описание задачи 1"
        },
        {
          "title": "Название задачи 2",
          "description": "Подробное описание задачи 2"
        },
        {
          "title": "Название задачи 3",
          "description": "Подробное описание задачи 3"
        }
      ],
      "stages": [
        {
          "name": "Название этапа 1",
          "completed": false
        },
        {
          "name": "Название этапа 2",
          "completed": false
        }
      ],
      "rewards": {
        "xp": 100,
        "gold": 50,
        "itemName": "Название награды"
      },
      "achievements": [
        {
          "id": "achievement1",
          "title": "Название достижения 1",
          "description": "Описание достижения 1",
          "unlocked": false
        },
        {
          "id": "achievement2",
          "title": "Название достижения 2",
          "description": "Описание достижения 2",
          "unlocked": false
        }
      ]
    }`;

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'Ты - генератор геймифицированных квестов в стиле MMORPG. Создавай интересные задачи, этапы, достижения и награды, которые мотивируют пользователя выполнять реальные задачи. Тематика квеста должна соответствовать запросу.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Не удалось получить ответ от OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Ошибка при генерации квеста:', error);
      throw new Error('Не удалось сгенерировать квест');
    }
  }
}
