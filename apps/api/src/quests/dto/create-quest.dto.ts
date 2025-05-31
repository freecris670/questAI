import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestDto {
  @ApiProperty({
    description: 'Название квеста',
    example: 'Приключение в мире кода'
  })
  @IsString()
  @IsOptional() // Поле title делаем опциональным для пробных квестов
  title?: string;

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
  
  @ApiPropertyOptional({
    description: 'ID пользователя, создавшего квест (опционально для пробных квестов)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsOptional()
  user_id?: string;
  
  @ApiPropertyOptional({
    description: 'Флаг, указывающий что квест создан неавторизованным пользователем',
    default: false,
    example: true
  })
  @IsBoolean()
  @IsOptional()
  trial_user?: boolean;
}
