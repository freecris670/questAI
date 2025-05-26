import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum QuestDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum QuestLength {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
}

export class GenerateQuestDto {
  @ApiProperty({
    description: 'Тема квеста',
    example: 'Разработка программного обеспечения'
  })
  @IsString()
  @IsNotEmpty()
  theme!: string;

  @ApiProperty({
    description: 'Сложность квеста',
    enum: QuestDifficulty,
    example: QuestDifficulty.MEDIUM
  })
  @IsEnum(QuestDifficulty)
  @IsNotEmpty()
  difficulty!: QuestDifficulty;
  
  // Для совместимости с существующим кодом
  get complexity(): QuestDifficulty {
    return this.difficulty;
  }

  @ApiProperty({
    description: 'Длина квеста',
    enum: QuestLength,
    example: QuestLength.MEDIUM
  })
  @IsEnum(QuestLength)
  @IsNotEmpty()
  length!: QuestLength;

  @ApiProperty({
    description: 'ID пользователя, создающего квест',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiPropertyOptional({
    description: 'Дополнительные пожелания для генерации квеста',
    example: 'Добавить задачи с фокусом на изучение TypeScript'
  })
  @IsString()
  @IsOptional()
  additionalDetails?: string;
}
