import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserProfileDto, UserStatsDto } from './dto';
import { IQuest } from '../interfaces/quest.interfaces';
import { SupabaseAuthGuard, User } from '../supabase/supabase.module';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {/* Сервис используется в методах */}

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
}
