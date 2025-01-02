import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UploadedFile, UseInterceptors, Res, UploadedFiles } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResumeService } from './resume.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { EducationDto } from './dto/education.dto';
import { ExperienceDto } from './dto/experience.dto';
import { SkillDto } from './dto/skill.dto';
import { User } from '../user/entities/user.entity';
import { Response } from 'express';
import { CompleteResumeDto } from './dto/complete-resume.dto';

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

  // Portfolio 관련 엔드포인트
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

  @Get(':id/portfolios/:portfolioId/download')
  @ApiOperation({ summary: '포트폴리오 파일 다운로드' })
  @ApiResponse({ 
    status: 200, 
    description: '파일 다운로드 성공',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  async downloadPortfolio(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @Param('portfolioId') portfolioId: number,
    @Res() response: Response,
  ) {
    const portfolio = await this.resumeService.getPortfolio(user.id, resumeId, portfolioId);
    
    // 파일명 인코딩 처리
    const encodedFilename = encodeURIComponent(portfolio.originalName)
      .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

    response.setHeader('Content-Type', portfolio.fileType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodedFilename}`
    );
    
    const fileStream = await this.resumeService.downloadPortfolio(user.id, resumeId, portfolioId);
    return fileStream.pipe(response);
  }
  /* 클라이어늩에서 사용 예시
// Fetch API 사용
const response = await fetch(`/api/resumes/${resumeId}/portfolios/${portfolioId}/download`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename; // 서버에서 제공하는 파일명
a.click();
window.URL.revokeObjectURL(url);

// Axios 사용
const response = await axios.get(`/api/resumes/${resumeId}/portfolios/${portfolioId}/download`, {
  responseType: 'blob',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.download = filename;
link.click();
window.URL.revokeObjectURL(url);
  */

  @Post('complete')
  @ApiOperation({ summary: '이력서 전체 정보 한 번에 생성' })
  @ApiResponse({ status: 201, description: '이력서 생성 성공' })
  async createCompleteResume(
    @CurrentUser() user: User,
    @Body() completeResumeDto: CompleteResumeDto,
  ) {
    return await this.resumeService.createCompleteResume(user.id, completeResumeDto);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: '이력서 전체 정보 한 번에 수정' })
  @ApiResponse({ status: 200, description: '이력서 수정 성공' })
  async updateCompleteResume(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @Body() completeResumeDto: CompleteResumeDto,
  ) {
    return await this.resumeService.updateCompleteResume(user.id, resumeId, completeResumeDto);
  }

  @Post('complete-with-files')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: '이력서 전체 정보와 포트폴리오 파일들을 한 번에 생성' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['completeResumeDto'],
      properties: {
        completeResumeDto: {
          type: 'string',  // JSON 문자열로 전송
          description: '이력서 정보 (JSON 문자열)',
          example: JSON.stringify({
            basicInfo: {
              name: '홍길동의 이력서',
              gender: '남성',
              birthDate: '1990-01-01',
              address: '서울시 강남구',
              phone: '010-1234-5678',
              jobStatus: '구직중'
            },
            educations: [{
              startDate: '2010-03-01',
              endDate: '2014-02-28',
              schoolName: '한국대학교',
              major: '컴퓨터공학',
              location: '서울',
              type: '4년제'
            }, 
            {
              startDate: '2014-03-01',
              endDate: '2017-02-28',
              schoolName: '한국대학교 대학원',
              major: '컴퓨터공학',
              location: '서울',
              type: '4년제'
            }],
            experiences: [{
              companyName: '네이버',
              position: '선임개발자',
              department: '플랫폼개발팀',
              jobRole: '백엔드 개발',
              location: '판교',
              startDate: '2017-03-01',
              endDate: '2020-02-29',
              description: '백엔드 시스템 설계 및 개발'
            }, 
            {
              companyName: '카카오',
              position: '선임개발자',
              department: '플랫폼개발팀',
              jobRole: '백엔드 설계',
              location: '판교',
              startDate: '2020-03-01',
              endDate: '2022-02-28',
              description: '백엔드 시스템 설계 및 개발'
            }],
            skills: [{
              skillName: 'Node.js',
              level: '상'
            },
            {
              skillName: 'Kafka',
              level: '상'
            },
            {
              skillName: 'Spark',
              level: '상'
            }]
          })
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          },
          description: '포트폴리오 파일들 (여러 개 가능)'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: '이력서 생성 성공' })
  async createCompleteResumeWithFiles(
    @CurrentUser() user: User,
    @Body('completeResumeDto') completeResumeDto: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const parsedDto = JSON.parse(completeResumeDto) as CompleteResumeDto;
    const resume = await this.resumeService.createCompleteResume(user.id, parsedDto);
    
    if (files?.length) {
      await Promise.all(
        files.map(file => 
          this.resumeService.uploadPortfolio(user.id, resume.id, file)
        )
      );
    }

    return await this.resumeService.getResume(user.id, resume.id);
  }

  @Put(':id/complete-with-files')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: '이력서 전체 정보와 포트폴리오 파일들을 한 번에 수정' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['completeResumeDto'],
      properties: {
        completeResumeDto: {
          type: 'string',
          description: '이력서 정보 (JSON 문자열)',
          example: JSON.stringify({
            basicInfo: {
              name: '홍길동의 이력서',
              gender: '남성',
              birthDate: '1990-01-01',
              address: '서울시 강남구',
              phone: '010-1234-5678',
              jobStatus: '구직중'
            },
            educations: [{
              startDate: '2010-03-01',
              endDate: '2014-02-28',
              schoolName: '한국대학교',
              major: '컴퓨터공학',
              location: '서울',
              type: '4년제'
            }, 
            {
              startDate: '2014-03-01',
              endDate: '2017-02-28',
              schoolName: '한국대학교 대학원',
              major: '컴퓨터공학',
              location: '서울',
              type: '4년제'
            }],
            experiences: [{
              companyName: '네이버',
              position: '선임개발자',
              department: '플랫폼개발팀',
              jobRole: '백엔드 개발',
              location: '판교',
              startDate: '2017-03-01',
              endDate: '2020-02-29',
              description: '백엔드 시스템 설계 및 개발'
            }, 
            {
              companyName: '카카오',
              position: '선임개발자',
              department: '플랫폼개발팀',
              jobRole: '백엔드 설계',
              location: '판교',
              startDate: '2020-03-01',
              endDate: '2022-02-28',
              description: '백엔드 시스템 설계 및 개발'
            }],
            skills: [{
              skillName: 'Node.js',
              level: '상'
            },
            {
              skillName: 'Kafka',
              level: '상'
            },
            {
              skillName: 'Spark',
              level: '상'
            }]
          })
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          },
          description: '포트폴리오 파일들 (여러 개 가능)'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: '이력서 수정 성공' })
  async updateCompleteResumeWithFiles(
    @CurrentUser() user: User,
    @Param('id') resumeId: number,
    @Body('completeResumeDto') completeResumeDto: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const parsedDto = JSON.parse(completeResumeDto) as CompleteResumeDto;
    await this.resumeService.updateCompleteResume(user.id, resumeId, parsedDto);
    
    if (files?.length) {
      await Promise.all(
        files.map(file => 
          this.resumeService.uploadPortfolio(user.id, resumeId, file)
        )
      );
    }

    return await this.resumeService.getResume(user.id, resumeId);
  }
} 