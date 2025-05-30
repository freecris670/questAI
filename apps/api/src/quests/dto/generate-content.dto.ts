import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class GenerateContentDto {
  @ApiProperty({
    description: 'Описание квеста',
    example: 'Квест на изучение основ TypeScript'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Название квеста',
    example: 'Путешествие в мир TypeScript'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Тип квеста',
    example: 'adventure',
    enum: ['adventure', 'learning', 'productivity', 'fitness']
  })
  @IsString()
  questType: string;

  @ApiProperty({
    description: 'Тип контента для генерации',
    example: 'stages',
    enum: ['stages', 'tasks', 'achievements']
  })
  @IsEnum(['stages', 'tasks', 'achievements'])
  contentType: 'stages' | 'tasks' | 'achievements';
}
