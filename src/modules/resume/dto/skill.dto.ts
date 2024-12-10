import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SkillDto {
  @ApiProperty({ example: 'Node.js' })
  @IsString()
  skillName: string;

  @ApiProperty({ example: '상' })
  @IsString()
  level: string;
} 