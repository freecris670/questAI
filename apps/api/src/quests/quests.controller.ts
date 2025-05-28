import { Controller, Get, Post, Body, Param, Put, Delete, Query, Patch, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
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
  @Throttle({ short: { ttl: 60000, limit: 3 }, medium: { ttl: 3600000, limit: 20 } }) // 3 запроса в минуту, 20 в час
  @UseGuards(SupabaseAuthGuard)
  async generate(
    @User('id') userId: string,
    @Body() generateQuestDto: GenerateQuestDto,
    @Req() request: Request
  ): Promise<IGeneratedQuestData> {
    // Получаем IP-адрес для отслеживания лимита
    let ipAddress = request.headers['x-forwarded-for'];
    if (Array.isArray(ipAddress)) {
      ipAddress = ipAddress[0];
    }
    const remoteAddress = request.connection?.remoteAddress || '127.0.0.1';
    const ip = ipAddress as string || remoteAddress;
    
    // Проверяем лимиты частоты запросов (даже для авторизованных пользователей)
    const minuteRateLimit = await this.questsService.checkMinuteRateLimit(ip);
    if (!minuteRateLimit.canCreate) {
      throw new Error('Превышен лимит запросов (3 в минуту). Пожалуйста, подождите.');
    }
    
    const hourRateLimit = await this.questsService.checkHourRateLimit(ip);
    if (!hourRateLimit.canCreate) {
      throw new Error('Превышен лимит запросов (20 в час). Пожалуйста, подождите.');
    }
    
    // Регистрируем попытку создания квеста
    await this.questsService.recordQuestAttempt(ip);
    
    return this.questsService.generateQuest(userId, generateQuestDto);
  }

  @Post('generate/trial')
  @ApiOperation({ summary: 'Сгенерировать пробный квест без авторизации' })
  @Throttle({ short: { ttl: 60000, limit: 3 }, medium: { ttl: 3600000, limit: 20 } }) // 3 запроса в минуту, 20 в час
  async generateTrial(
    @Body() generateQuestDto: GenerateQuestDto,
    @Req() request: Request
  ): Promise<IGeneratedQuestData> {
    // Получаем IP-адрес для отслеживания лимита
    let ipAddress = request.headers['x-forwarded-for'];
    if (Array.isArray(ipAddress)) {
      ipAddress = ipAddress[0];
    }
    const remoteAddress = request.connection?.remoteAddress || '127.0.0.1';
    const ip = ipAddress as string || remoteAddress;
    
    // Проверяем лимит пробных квестов
    const { canCreate, questsCreated, maxTrialQuests, reason } = await this.questsService.checkTrialQuestsLimit(ip);
    if (!canCreate) {
      const errorMessages = {
        'max_total_exceeded': `Достигнут лимит пробных квестов (${questsCreated}/${maxTrialQuests})`,
        'minute_rate_exceeded': 'Превышен лимит запросов (3 в минуту). Пожалуйста, подождите.',
        'hour_rate_exceeded': 'Превышен лимит запросов (20 в час). Пожалуйста, подождите.'
      };
      
      const errorMessage = reason ? errorMessages[reason] : 'Достигнут лимит запросов';
      throw new Error(errorMessage);
    }
    
    // Регистрируем попытку создания квеста для отслеживания частоты
    await this.questsService.recordQuestAttempt(ip);
    
    // Генерируем квест для анонимного пользователя
    const quest = await this.questsService.generateTrialQuest(generateQuestDto);
    
    // Увеличиваем счетчик общего количества квестов
    await this.questsService.incrementTrialQuestsCount(ip);
    
    return quest;
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
  
  @Get('trial/check-limit')
  @ApiOperation({ summary: 'Проверка лимита созданных пробных квестов' })
  async checkTrialQuestsLimit(@Req() request: Request) {
    // Получаем IP-адрес из заголовков
    let ipAddress = request.headers['x-forwarded-for'];
    if (Array.isArray(ipAddress)) {
      ipAddress = ipAddress[0];
    }
    // Используем фолбэк для локальной разработки
    const remoteAddress = request.connection?.remoteAddress || '127.0.0.1';
    const ip = ipAddress as string || remoteAddress;
    
    // Получаем информацию о лимитах
    const trialLimits = await this.questsService.checkTrialQuestsLimit(ip);
    
    // Дополнительно получаем информацию о частоте запросов
    const minuteRateLimit = await this.questsService.checkMinuteRateLimit(ip);
    const hourRateLimit = await this.questsService.checkHourRateLimit(ip);
    
    return {
      ...trialLimits,
      minuteRateLimit: {
        canCreate: minuteRateLimit.canCreate,
        requestsInLastMinute: minuteRateLimit.requestsInLastMinute,
        maxRequestsPerMinute: 3
      },
      hourRateLimit: {
        canCreate: hourRateLimit.canCreate,
        requestsInLastHour: hourRateLimit.requestsInLastHour,
        maxRequestsPerHour: 20
      }
    };
  }
  
  @Post('trial/increment')
  @ApiOperation({ summary: 'Увеличение счетчика пробных квестов' })
  async incrementTrialQuestsCount(@Req() request: Request) {
    // Получаем IP-адрес из заголовков
    let ipAddress = request.headers['x-forwarded-for'];
    if (Array.isArray(ipAddress)) {
      ipAddress = ipAddress[0];
    }
    // Используем фолбэк для локальной разработки
    const remoteAddress = request.connection?.remoteAddress || '127.0.0.1';
    return { questsCreated: await this.questsService.incrementTrialQuestsCount(ipAddress as string || remoteAddress) };
  }
}
