import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateQuestDto {
  @ApiPropertyOptional({
    description: 'Название квеста',
    example: 'Обновленное название квеста'
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Описание квеста',
    example: 'Обновленное описание квеста'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Структурированные данные квеста',
    example: {}
  })
  @IsObject()
  @IsOptional()
  content?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Флаг публичности квеста',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
