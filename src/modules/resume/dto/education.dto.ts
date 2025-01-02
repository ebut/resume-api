import { IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class EducationDto {
  @ApiProperty({ example: '2010-03-01' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ example: '2014-02-28' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({ example: '한국대학교' })
  @IsString()
  schoolName: string;

  @ApiProperty({ example: '컴퓨터공학' })
  @IsString()
  major: string;

  @ApiProperty({ example: '서울' })
  @IsString()
  location: string;

  @ApiProperty({ example: '4년제' })
  @IsString()
  type: string;

  @ApiProperty({ required: false, example: '4.0' })
  @IsOptional()
  @IsString()
  gpa?: string;

  @ApiProperty({ required: false, example: '4.5' })
  @IsOptional()
  @IsString()
  maxGpa?: string;
} 