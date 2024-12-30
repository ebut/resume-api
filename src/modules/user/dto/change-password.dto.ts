import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: '현재 비밀번호' })
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @ApiProperty({ description: '새 비밀번호' })
  @IsString()
  @MinLength(8)
  newPassword: string;
} 