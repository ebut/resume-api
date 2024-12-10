import { IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResumeDto {
  @ApiProperty({ example: '홍길동의 이력서' })
  @IsString()
  name: string;

  @ApiProperty({ example: '남성' })
  @IsString()
  gender: string;

  @ApiProperty({ example: '1990-01-01' })
  @Type(() => Date)
  @IsDate()
  birthDate: Date;

  @ApiProperty({ example: '서울시 강남구' })
  @IsString()
  address: string;

  @ApiProperty({ example: '010-1234-5678' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '구직중' })
  @IsString()
  jobStatus: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
} 