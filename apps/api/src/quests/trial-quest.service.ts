import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { TrialQuestsRepository } from './trial-quests.repository';
import { OpenAiService } from '../openai/openai.service';
import { GenerateQuestDto } from './dto';
import { IGeneratedQuestData } from '../interfaces/quest.interfaces';
import { getIpFromRequest } from '../utils/request.utils';
import { Request } from 'express';

/**
 * @class TrialQuestService
 * @description Сервис для управления логикой пробных квестов для неавторизованных пользователей.
 * Отвечает за проверку лимитов, генерацию и получение пробных квестов.
 */
@Injectable()
export class TrialQuestService {
  private readonly logger = new Logger(TrialQuestService.name);
  private readonly MAX_TRIAL_QUESTS = 5;

  constructor(
    private readonly trialQuestsRepository: TrialQuestsRepository,
    private readonly openAiService: OpenAiService,
  ) {}

  /**
   * Проверяет, не превысил ли пользователь с данным IP-адресом лимит на создание пробных квестов.
   * @param {string} ipAddress - IP-адрес пользователя.
   * @throws {ForbiddenException} Если лимит превышен.
   */
  public async checkTrialQuestsLimit(ipAddress: string): Promise<void> {
    const userQuests = await this.trialQuestsRepository.findByIp(ipAddress);
    if (userQuests.length >= this.MAX_TRIAL_QUESTS) {
      this.logger.warn(`Trial quest limit reached for IP: ${ipAddress}`);
      throw new ForbiddenException('Превышен лимит пробных квестов');
    }
  }

  /**
   * Генерирует новый пробный квест для неавторизованного пользователя.
   * @param {GenerateQuestDto} dto - Параметры для генерации.
   * @param {string} ipAddress - IP-адрес пользователя.
   * @returns {Promise<IGeneratedQuestData>} Данные сгенерированного квеста.
   */
  async generateTrialQuest(dto: GenerateQuestDto, ipAddress: string): Promise<IGeneratedQuestData> {
    await this.checkTrialQuestsLimit(ipAddress);

    this.logger.log(`Generating trial quest for IP ${ipAddress} with theme: ${dto.theme}`);
    
    const questContent = await this.openAiService.generateQuest({
      theme: dto.theme,
      complexity: dto.difficulty,
      length: dto.length,
    });

    const newQuest = await this.trialQuestsRepository.create(dto.theme, ipAddress, questContent);
    this.logger.log(`New trial quest ${newQuest.id} created for IP ${ipAddress}`);

    return {
      id: newQuest.id,
      title: newQuest.title,
      description: newQuest.description,
      questType: questContent.questType || 'adventure',
      difficulty: questContent.difficulty || dto.difficulty,
      tasks: questContent.tasks || [],
      rewards: questContent.rewards || {},
    };
  }

  /**
   * Находит пробный квест по ID.
   * @param {string} id - ID квеста.
   */
  async findTrialQuestById(id: string) {
    return this.trialQuestsRepository.findById(id);
  }

  /**
   * Находит все пробные квесты по IP-адресу.
   * @param {string} ipAddress - IP-адрес пользователя.
   */
  async findTrialQuestsByIp(ipAddress: string) {
    return this.trialQuestsRepository.findByIp(ipAddress);
  }
} 