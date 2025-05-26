import { Controller, Get, Post, Body, Param, Put, Delete, Query, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { QuestsService } from './quests.service';
import { CreateQuestDto, GenerateQuestDto, UpdateQuestDto, UpdateQuestProgressDto, PublishQuestDto } from './dto';
import { IQuest, IQuestDetails, IGeneratedQuestData, IQuestProgress } from '../interfaces/quest.interfaces';
import { SupabaseAuthGuard, User } from '../supabase/supabase.module';

@ApiTags('Квесты')
@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список квестов' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID пользователя для фильтрации квестов' })
  @ApiBearerAuth()
  async findAll(@Query('userId') userId?: string): Promise<IQuest[]> {
    return this.questsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить квест по ID' })
  @ApiParam({ name: 'id', description: 'ID квеста' })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<IQuestDetails> {
    return this.questsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новый квест' })
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  async create(
    @User('id') userId: string,
    @Body() createQuestDto: CreateQuestDto
  ) {
    return this.questsService.create({ ...createQuestDto, user_id: userId });
  }

  @Post('generate')
  @ApiOperation({ summary: 'Сгенерировать новый квест с помощью AI' })
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  async generate(
    @User('id') userId: string,
    @Body() generateQuestDto: GenerateQuestDto
  ): Promise<IGeneratedQuestData> {
    return this.questsService.generateQuest(userId, generateQuestDto);
  }

  @Put(':id/save')
  @ApiOperation({ summary: 'Сохранение/обновление квеста' })
  @ApiParam({ name: 'id', description: 'ID квеста' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateQuestDto: UpdateQuestDto,
  ) {
    return this.questsService.update(id, updateQuestDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить квест' })
  @ApiParam({ name: 'id', description: 'ID квеста' })
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.questsService.remove(id);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Обновление прогресса выполнения квеста' })
  @ApiParam({ name: 'id', description: 'ID квеста' })
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  async updateProgress(
    @User('id') userId: string,
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateQuestProgressDto,
  ): Promise<IQuestProgress> {
    return this.questsService.updateProgress(id, userId, updateProgressDto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Публикация квеста' })
  @ApiParam({ name: 'id', description: 'ID квеста' })
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  async publishQuest(
    @User('id') userId: string,
    @Param('id') id: string,
    @Body() publishQuestDto: PublishQuestDto,
  ) {
    return this.questsService.publishQuest(id, userId, publishQuestDto);
  }

  @Get(':id/achievements')
  @ApiOperation({ summary: 'Получить список достижений квеста' })
  @ApiParam({ name: 'id', description: 'ID квеста' })
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  async getAchievements(
    @User('id') userId: string,
    @Param('id') id: string
  ) {
    return this.questsService.getAchievements(id, userId);
  }
}
