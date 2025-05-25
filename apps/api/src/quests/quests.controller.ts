import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { QuestsService } from './quests.service';
import * as questsInterfaces from './quests.interfaces';

@ApiTags('Квесты')
@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все квесты' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID пользователя для фильтрации квестов' })
  async findAll(@Query('userId') userId?: string) {
    return this.questsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить квест по ID' })
  @ApiParam({ name: 'id', description: 'ID квеста' })
  async findOne(@Param('id') id: string) {
    return this.questsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новый квест' })
  @ApiBearerAuth()
  async create(@Body() createQuestDto: questsInterfaces.CreateQuestDto) {
    return this.questsService.create(createQuestDto);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Сгенерировать новый квест с помощью AI' })
  @ApiBearerAuth()
  async generate(@Body() generateQuestDto: questsInterfaces.GenerateQuestDto) {
    return this.questsService.generateQuest(generateQuestDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить квест' })
  @ApiParam({ name: 'id', description: 'ID квеста' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateQuestDto: questsInterfaces.UpdateQuestDto,
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
}
