import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateQuestProgressDto {
  @ApiProperty({
    description: 'ID задачи, прогресс которой обновляется',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  taskId: string = '';

  @ApiProperty({
    description: 'Статус выполнения задачи',
    example: true
  })
  @IsBoolean()
  completed: boolean = false;

  @ApiPropertyOptional({
    description: 'Прогресс выполнения задачи (0-100)',
    example: 75,
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;
}
