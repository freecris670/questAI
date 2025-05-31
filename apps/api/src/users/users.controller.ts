import { Controller, Get, Put, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UserProfileDto, UserStatsDto } from './dto';
import { IQuest } from '../interfaces/quest.interfaces';
import { SupabaseAuthGuard, User } from '../supabase/supabase.module';
import { QuestsService } from '../quests/quests.service';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly questsService: QuestsService,
  ) {/* Сервисы используются в методах */}

  @Get(':id/profile')
  @ApiOperation({ summary: 'Получить профиль пользователя' })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  async getUserProfile(@Param('id') userId: string) {
    return this.usersService.getUserProfile(userId);
  }

  @Put(':id/profile')
  @ApiOperation({ summary: 'Обновить профиль пользователя' })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiBearerAuth()
  async updateUserProfile(
    @Param('id') userId: string,
    @Body() profileData: Partial<{
      username: string;
      full_name: string;
      avatar_url: string;
    }>,
  ) {
    return this.usersService.updateUserProfile(userId, profileData);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Получить статистику пользователя' })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiBearerAuth()
  async getUserStats(@Param('id') userId: string) {
    return this.usersService.getUserStats(userId);
  }

  @Get(':id/subscription')
  @ApiOperation({ summary: 'Получить информацию о подписке пользователя' })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiBearerAuth()
  async getUserSubscription(@Param('id') userId: string) {
    return this.usersService.getUserSubscription(userId);
  }
  
  @Get('profile')
  @ApiOperation({ summary: 'Получить данные профиля авторизованного пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль пользователя', type: UserProfileDto })
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  async getCurrentUserProfile(@User('id') userId: string) {
    return this.usersService.getUserProfile(userId);
  }
  
  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику авторизованного пользователя' })
  @ApiResponse({ status: 200, description: 'Статистика пользователя', type: UserStatsDto })
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  async getCurrentUserStats(@User('id') userId: string) {
    return this.usersService.getUserStats(userId);
  }
  
  @Get('quests/active')
  @ApiOperation({ summary: 'Получить список активных квестов пользователя' })
  @ApiResponse({ status: 200, description: 'Список активных квестов', type: [Object] })
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  async getActiveQuests(@User('id') userId: string) {
    return this.usersService.getActiveQuests(userId);
  }
  
  @Post('migrate-trial-quests')
  @ApiOperation({ summary: 'Миграция пробных квестов при авторизации пользователя' })
  @ApiResponse({ status: 200, description: 'Информация о мигрированных квестах' })
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  async migrateTrialQuests(
    @User('id') userId: string,
    @Req() request: Request
  ) {
    // Получаем IP-адрес из заголовков
    let ipAddress = request.headers['x-forwarded-for'];
    if (Array.isArray(ipAddress)) {
      ipAddress = ipAddress[0];
    }
    const remoteAddress = request.connection?.remoteAddress || '127.0.0.1';
    const ip = ipAddress as string || remoteAddress;
    
    // Вызываем метод миграции пробных квестов
    return this.questsService.migrateTrialQuests(ip, userId);
  }
}
