import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateQuestDto, UpdateQuestDto, PublishQuestDto } from './dto';
import { IQuest, IQuestDetails } from '../interfaces/quest.interfaces';
import { QuestsRepository } from './quests.repository';

@Injectable()
export class QuestsService {
  constructor(
    private readonly questsRepository: QuestsRepository,
  ) {}

  async findAll(userId?: string): Promise<IQuest[]> {
    return this.questsRepository.findAll(userId);
  }

  async findOne(id: string): Promise<IQuestDetails> {
    const questDetails = await this.questsRepository.findQuestDetails(id);
    if (!questDetails) {
      throw new NotFoundException(`Квест с ID ${id} не найден`);
    }
    // Здесь в будущем можно будет добавить логику расчета прогресса
    return questDetails;
  }

  async create(questData: CreateQuestDto, userId: string): Promise<IQuest> {
    // Здесь может быть дополнительная бизнес-логика перед созданием
    return this.questsRepository.create(questData, userId);
  }

  async update(id: string, questData: UpdateQuestDto, userId: string): Promise<IQuest> {
    const quest = await this.questsRepository.findById(id);
    if (!quest) {
      throw new NotFoundException(`Квест с ID ${id} не найден`);
    }
    if (quest.user_id !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужой квест');
    }
    return this.questsRepository.update(id, questData);
  }

  async remove(id: string, userId: string): Promise<void> {
    const quest = await this.questsRepository.findById(id);
    if (!quest) {
      throw new NotFoundException(`Квест с ID ${id} не найден`);
    }
    if (quest.user_id !== userId) {
      throw new ForbiddenException('Вы не можете удалить чужой квест');
    }
    await this.questsRepository.delete(id);
  }
  
  async publishQuest(id: string, userId: string, publishData: PublishQuestDto): Promise<IQuest> {
    const quest = await this.questsRepository.findById(id);
    if (!quest) {
      throw new NotFoundException(`Квест с ID ${id} не найден`);
    }
    if (quest.user_id !== userId) {
      throw new ForbiddenException('Вы не можете опубликовать чужой квест');
    }
    return this.questsRepository.update(id, { isPublic: publishData.isPublic });
  }
}
