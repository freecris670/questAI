import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UserProfileDto {
  @ApiProperty({
    description: 'ID пользователя',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  id!: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'ИванПрограммист'
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Текущий уровень пользователя',
    example: 5
  })
  @IsNumber()
  level!: number;

  @ApiProperty({
    description: 'Прогресс до следующего уровня (в процентах)',
    example: 75
  })
  @IsNumber()
  levelProgress!: number;

  @ApiProperty({
    description: 'Опыт, необходимый для достижения следующего уровня',
    example: 1000
  })
  @IsNumber()
  xpNeeded!: number;

  @ApiProperty({
    description: 'Количество созданных квестов',
    example: 12
  })
  @IsNumber()
  questsCreated!: number;

  @ApiProperty({
    description: 'Количество завершенных квестов',
    example: 8
  })
  @IsNumber()
  questsCompleted!: number;

  @ApiProperty({
    description: 'Процент успешного завершения квестов',
    example: 75.5
  })
  @IsNumber()
  successRate!: number;
}
