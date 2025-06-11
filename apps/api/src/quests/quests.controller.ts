import { Controller, Get, Post, Body, Param, Put, Delete, Query, Patch, UseGuards, Req, ForbiddenException, Optional } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { QuestsService } from './quests.service';
import { QuestGenerationService } from './quest-generation.service';
import { TrialQuestService } from './trial-quest.service';
import { CreateQuestDto, GenerateQuestDto, UpdateQuestDto, UpdateQuestProgressDto, PublishQuestDto, GenerateContentDto } from './dto';
import { IQuest, IQuestDetails, IGeneratedQuestData, IQuestProgress } from '../interfaces/quest.interfaces';
import { SupabaseAuthGuard, User } from '../supabase/supabase.module';
import { AuthGuard } from '../auth/auth.guard';
import { getIpFromRequest } from '../utils/get-ip-from-request';

@ApiTags('Квесты')
@Controller('quests')
export class QuestsController {
  constructor(
    private readonly questsService: QuestsService,
    private readonly questGenerationService: QuestGenerationService,
    private readonly trialQuestService: TrialQuestService,
  ) {}

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

  @Get('trial')
  @ApiOperation({ summary: 'Получить все пробные квесты по IP адресу' })
  async getTrialQuests(@Req() request: Request) {
    // Получаем IP-адрес пользователя
    const ip = getIpFromRequest(request);
    
    return this.questsService.getTrialQuestsByIp(ip);
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Создать новый квест' })
  @ApiBearerAuth()
  async create(
    @Body() createQuestDto: CreateQuestDto,
    @Request() req
  ) {
    return this.questsService.create(createQuestDto, req.user.sub);
  }

  @Post('generate')
  async generate(@Body() generateQuestDto: GenerateQuestDto, @Req() req: Request, @Request() nestReq) {
    // Если есть авторизованный пользователь, используем QuestGenerationService
    if (nestReq.user) {
      return this.questGenerationService.generateQuest(generateQuestDto, nestReq.user.sub);
    }
    
    // Иначе, это пробный квест
    const ip = getIpFromRequest(req);
    return this.trialQuestService.generateTrialQuest(generateQuestDto, ip);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Сохранение/обновление квеста' })
  @ApiParam({ name: 'id', description: 'ID квеста' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateQuestDto: UpdateQuestDto,
    @Request() req
  ) {
    return this.questsService.update(id, updateQuestDto, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить квест' })
  @ApiParam({ name: 'id', description: 'ID квеста' })
  @ApiBearerAuth()
  async remove(
    @Param('id') id: string,
    @Request() req
  ) {
    return this.questsService.remove(id, req.user.sub);
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
  
  @Patch('trial/:id/progress')
  @ApiOperation({ summary: 'Обновление прогресса выполнения пробного квеста для неавторизованных пользователей' })
  @ApiParam({ name: 'id', description: 'ID пробного квеста' })
  async updateTrialProgress(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateQuestProgressDto,
  ): Promise<IQuestProgress> {
    // Получаем IP адрес пользователя из заголовков
    const ip = getIpFromRequest(request);
    return this.questsService.updateTrialProgress(id, ip, updateProgressDto);
  }

  @UseGuards(AuthGuard)
  @Put(':id/publish')
  @ApiOperation({ summary: 'Публикация квеста' })
  @ApiParam({ name: 'id', description: 'ID квеста' })
  @ApiBearerAuth()
  async publish(
    @Param('id') id: string,
    @Body() publishQuestDto: PublishQuestDto,
    @Request() req
  ) {
    return this.questsService.publishQuest(id, req.user.sub, publishQuestDto);
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
    // Получаем IP-адрес пользователя
    const ip = getIpFromRequest(request);
    
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
    // Получаем IP-адрес пользователя
    const ip = getIpFromRequest(request);
    return { questsCreated: await this.questsService.incrementTrialQuestsCount(ip) };
  }
  
  
  @Post('generate-content')
  @ApiOperation({ summary: 'Генерация контента для квеста (этапы, задачи, достижения)' })
  @Throttle({ short: { ttl: 60000, limit: 5 } }) // 5 запросов в минуту
  async generateContent(@Body() generateContentDto: GenerateContentDto) {
    return this.questsService.generateContent(generateContentDto);
  }

  @Get('trial')
  async findTrialQuests(@Req() req: Request) {
    const ip = getIpFromRequest(req);
    return this.trialQuestService.findTrialQuestsByIp(ip);
  }

  @Get('trial/:id')
  async findTrialQuestById(@Param('id') id: string) {
    const quest = await this.trialQuestService.findTrialQuestById(id);
    if (!quest) {
      throw new Error('Пробный квест не найден');
    }
    return quest;
  }
}
