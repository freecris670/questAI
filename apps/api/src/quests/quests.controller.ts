import { Controller, Get, Post, Body, Param, Put, Delete, Query, Patch, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { QuestsService } from './quests.service';
import { CreateQuestDto, GenerateQuestDto, UpdateQuestDto, UpdateQuestProgressDto, PublishQuestDto, GenerateContentDto } from './dto';
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

  @Get('trial/:id')
  @ApiOperation({ summary: 'Получить пробный квест по ID' })
  @ApiParam({ name: 'id', description: 'ID пробного квеста' })
  async getTrialQuest(@Param('id') id: string) {
    return this.questsService.getTrialQuest(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новый квест' })
  @ApiBearerAuth()
  async create(
    @User('id') userId: string,
    @Body() createQuestDto: CreateQuestDto,
    @Req() request: Request
  ) {
    // Проверяем, является ли это запросом от неавторизованного пользователя
    if (createQuestDto.trial_user) {
      // Запрос от неавторизованного пользователя - создаем trial квест
      // Получаем IP-адрес для идентификации неавторизованного пользователя
      let ipAddress = request.headers['x-forwarded-for'];
      if (Array.isArray(ipAddress)) {
        ipAddress = ipAddress[0];
      }
      const remoteAddress = request.connection?.remoteAddress || '127.0.0.1';
      const ip = ipAddress as string || remoteAddress;
      
      // Проверяем, не превышен ли лимит пробных квестов
      const trialLimits = await this.questsService.checkTrialQuestsLimit(ip);
      if (!trialLimits.canCreate) {
        throw new ForbiddenException('Превышен лимит пробных квестов');
      }
      
      // Создаем пробный квест
      const result = await this.questsService.createTrialQuest({
        ...createQuestDto,
        ip_address: ip
      });
      
      // Увеличиваем счетчик пробных квестов
      await this.questsService.incrementTrialQuestsCount(ip);
      
      return result;
    } else if (!userId) {
      // Если не указан trial_user и нет userId, значит запрос неавторизованный
      throw new ForbiddenException('Для создания квеста необходима авторизация');
    }
    
    // Запрос от авторизованного пользователя - создаем обычный квест
    return this.questsService.create({ ...createQuestDto, user_id: userId });
  }

  @Post('generate')
  @ApiOperation({ summary: 'Сгенерировать новый квест с помощью AI' })
  @ApiBearerAuth()
  @Throttle({ short: { ttl: 60000, limit: 3 }, medium: { ttl: 3600000, limit: 20 } }) // 3 запроса в минуту, 20 в час
  async generate(
    @Body() generateQuestDto: GenerateQuestDto,
    @Req() request: Request,
    @User('id') userId?: string
  ): Promise<IGeneratedQuestData> {
    // Получаем IP-адрес для отслеживания лимита
    let ipAddress = request.headers['x-forwarded-for'];
    if (Array.isArray(ipAddress)) {
      ipAddress = ipAddress[0];
    }
    const remoteAddress = request.connection?.remoteAddress || '127.0.0.1';
    const ip = ipAddress as string || remoteAddress;
    
    // Проверяем лимиты частоты запросов
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
    
    // Если userId не передан или равен 'anonymous', генерируем пробный квест
    if (!userId || generateQuestDto.userId === 'anonymous') {
      return this.questsService.generateTrialQuest(generateQuestDto, ip);
    }
    
    // Иначе генерируем обычный квест для авторизованного пользователя
    return this.questsService.generateQuest(userId, generateQuestDto, ip);
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
  
  
  @Post('generate-content')
  @ApiOperation({ summary: 'Генерация контента для квеста (этапы, задачи, достижения)' })
  @Throttle({ short: { ttl: 60000, limit: 5 } }) // 5 запросов в минуту
  async generateContent(@Body() generateContentDto: GenerateContentDto) {
    return this.questsService.generateContent(generateContentDto);
  }
}
