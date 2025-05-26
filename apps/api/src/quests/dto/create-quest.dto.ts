import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestDto {
  @ApiProperty({
    description: 'Название квеста',
    example: 'Приключение в мире кода'
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    description: 'Описание квеста',
    example: 'Исследуйте захватывающий мир программирования через серию задач'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Структурированные данные квеста',
    example: {}
  })
  @IsNotEmpty()
  content!: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Флаг публичности квеста',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
  
  @ApiProperty({
    description: 'ID пользователя, создавшего квест',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  user_id!: string;
}
