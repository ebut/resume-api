import { IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ExperienceDto {
  @ApiProperty({ example: '네이버' })
  @IsString()
  companyName: string;

  @ApiProperty({ example: '선임개발자' })
  @IsString()
  position: string;

  @ApiProperty({ example: '플랫폼개발팀' })
  @IsString()
  department: string;

  @ApiProperty({ example: '백엔드 개발' })
  @IsString()
  jobRole: string;

  @ApiProperty({ example: '판교' })
  @IsString()
  location: string;

  @ApiProperty({ example: '2015-03-01' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ example: '2020-02-29' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({ example: '백엔드 시스템 설계 및 개발' })
  @IsString()
  description: string;
} 