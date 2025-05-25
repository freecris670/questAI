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
   * Генерирует квест на основе заданных параметров
   */
  async generateQuest(params: {
    theme: string;
    complexity: 'easy' | 'medium' | 'hard';
    length: 'short' | 'medium' | 'long';
  }) {
    const { theme, complexity, length } = params;

    const prompt = `Создай интерактивный квест на тему "${theme}". 
    Сложность: ${complexity}. 
    Длина: ${length}.
    
    Формат ответа должен быть в JSON:
    {
      "title": "Название квеста",
      "description": "Краткое описание квеста",
      "startNode": "start",
      "nodes": {
        "start": {
          "text": "Начальный текст квеста",
          "choices": [
            {
              "text": "Вариант выбора 1",
              "nextNode": "node1"
            },
            {
              "text": "Вариант выбора 2",
              "nextNode": "node2"
            }
          ]
        },
        "node1": {
          "text": "Текст для node1",
          "choices": [...]
        },
        ...
      }
    }`;

    try {
      const response = await this.openaiClient.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'Ты - генератор интерактивных квестов. Создавай увлекательные и логичные истории с разветвленным сюжетом.',
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
