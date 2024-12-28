import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateResumeDto } from './create-resume.dto';
import { EducationDto } from './education.dto';
import { ExperienceDto } from './experience.dto';
import { SkillDto } from './skill.dto';

export class CompleteResumeDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateResumeDto)
  basicInfo: CreateResumeDto;

  @ApiProperty({ type: [EducationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  educations?: EducationDto[];

  @ApiProperty({ type: [ExperienceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experiences?: ExperienceDto[];

  @ApiProperty({ type: [SkillDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];
} 