import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';

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
}
