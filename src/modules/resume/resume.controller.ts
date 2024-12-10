import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResumeService } from './resume.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { EducationDto } from './dto/education.dto';
import { ExperienceDto } from './dto/experience.dto';
import { SkillDto } from './dto/skill.dto';
import { User } from '../user/entities/user.entity';

@ApiTags('이력서')
@Controller('api/resumes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  @ApiOperation({ summary: '이력서 생성' })
  async createResume(
    @CurrentUser() user: User,
    @Body() createResumeDto: CreateResumeDto,
  ) {
    return await this.resumeService.createResume(user.id, createResumeDto);
  }

  @Get()
  @ApiOperation({ summary: '이력서 목록 조회' })
  async getResumes(@CurrentUser() user: User) {
    return await this.resumeService.getUserResumes(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '이력서 상세 조회' })
  async getResume(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
  ) {
    return await this.resumeService.getResume(user.id, resumeId);
  }

  @Put(':id')
  @ApiOperation({ summary: '이력서 수정' })
  async updateResume(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @Body() updateResumeDto: CreateResumeDto,
  ) {
    return await this.resumeService.updateResume(user.id, resumeId, updateResumeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '이력서 삭제' })
  async deleteResume(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
  ) {
    return await this.resumeService.deleteResume(user.id, resumeId);
  }

  // Education 관련 엔드포인트
  @Post(':id/education')
  @ApiOperation({ summary: '학력 정보 추가' })
  async addEducation(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @Body() educationDto: EducationDto,
  ) {
    return await this.resumeService.addEducation(user.id, resumeId, educationDto);
  }

  @Put(':id/education/:eduId')
  @ApiOperation({ summary: '학력 정보 수정' })
  async updateEducation(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @Param('eduId') educationId: number,
    @Body() educationDto: EducationDto,
  ) {
    return await this.resumeService.updateEducation(user.id, resumeId, educationId, educationDto);
  }

  @Delete(':id/education/:eduId')
  @ApiOperation({ summary: '학력 정보 삭제' })
  async deleteEducation(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @Param('eduId') educationId: number,
  ) {
    return await this.resumeService.deleteEducation(user.id, resumeId, educationId);
  }

  // Experience 관련 엔드포인트
  @Post(':id/experience')
  @ApiOperation({ summary: '경력 정보 추가' })
  async addExperience(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @Body() experienceDto: ExperienceDto,
  ) {
    return await this.resumeService.addExperience(user.id, resumeId, experienceDto);
  }

  @Put(':id/experience/:expId')
  @ApiOperation({ summary: '경력 정보 수정' })
  async updateExperience(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @Param('expId') experienceId: number,
    @Body() experienceDto: ExperienceDto,
  ) {
    return await this.resumeService.updateExperience(user.id, resumeId, experienceId, experienceDto);
  }

  @Delete(':id/experience/:expId')
  @ApiOperation({ summary: '경력 정보 삭제' })
  async deleteExperience(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @Param('expId') experienceId: number,
  ) {
    return await this.resumeService.deleteExperience(user.id, resumeId, experienceId);
  }

  // Skill 관련 엔드포인트
  @Post(':id/skills')
  @ApiOperation({ summary: '기술 정보 추가' })
  async addSkill(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @Body() skillDto: SkillDto,
  ) {
    return await this.resumeService.addSkill(user.id, resumeId, skillDto);
  }

  @Put(':id/skills/:skillId')
  @ApiOperation({ summary: '기술 정보 수정' })
  async updateSkill(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @Param('skillId') skillId: number,
    @Body() skillDto: SkillDto,
  ) {
    return await this.resumeService.updateSkill(user.id, resumeId, skillId, skillDto);
  }

  @Delete(':id/skills/:skillId')
  @ApiOperation({ summary: '기술 정보 삭제' })
  async deleteSkill(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @Param('skillId') skillId: number,
  ) {
    return await this.resumeService.deleteSkill(user.id, resumeId, skillId);
  }

  // Portfolio 관련 ���드포인트
  @Post(':id/portfolios')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '포트폴리오 파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '업로드할 포트폴리오 파일'
        }
      }
    }
  })
  async uploadPortfolio(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    //console.log('파일 업로드:', file.originalname); // 한글 확인
    return await this.resumeService.uploadPortfolio(user.id, resumeId, file);
  }

  @Delete(':id/portfolios/:portfolioId')
  @ApiOperation({ summary: '포트폴리오 파일 삭제' })
  async deletePortfolio(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @Param('portfolioId') portfolioId: number,
  ) {
    return await this.resumeService.deletePortfolio(user.id, resumeId, portfolioId);
  }

  @Get(':id/portfolios')
  @ApiOperation({ summary: '포트폴리오 목록 조회' })
  async getPortfolios(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
  ) {
    return await this.resumeService.getPortfolios(user.id, resumeId);
  }

  @Get(':id/portfolios/:portfolioId')
  @ApiOperation({ summary: '포트폴리오 상세 조회' })
  async getPortfolio(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @Param('portfolioId') portfolioId: number,
  ) {
    return await this.resumeService.getPortfolio(user.id, resumeId, portfolioId);
  }
} 