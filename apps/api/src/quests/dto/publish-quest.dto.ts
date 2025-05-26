import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class PublishQuestDto {
  @ApiProperty({
    description: 'Статус публикации квеста',
    example: true
  })
  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean = false;
}
