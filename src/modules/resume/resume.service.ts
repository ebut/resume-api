import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ResumeRepository } from './resume.repository';
import { CreateResumeDto } from './dto/create-resume.dto';
import { EducationDto } from './dto/education.dto';
import { ExperienceDto } from './dto/experience.dto';
import { SkillDto } from './dto/skill.dto';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class ResumeService {
  constructor(
    private readonly resumeRepository: ResumeRepository,
    private readonly minioService: MinioService,
  ) {}

  async createResume(userId: number, createResumeDto: CreateResumeDto) {
    const resume = await this.resumeRepository.createResume({
      ...createResumeDto,
      userId,
    });
    return resume;
  }

  async getResume(userId: number, resumeId: number) {
    const resume = await this.resumeRepository.findResumeById(resumeId);
    if (!resume) {
      throw new NotFoundException('이력서를 찾을 수 없습니다.');
    }
    if (resume.userId !== userId) {
      throw new UnauthorizedException('접근 권한이 없습니다.');
    }
    return resume;
  }

  async getUserResumes(userId: number) {
    return await this.resumeRepository.findResumesByUserId(userId);
  }

  async updateResume(userId: number, resumeId: number, updateData: Partial<CreateResumeDto>) {
    const resume = await this.getResume(userId, resumeId);
    await this.resumeRepository.updateResume(resumeId, updateData);
    return { message: '이력서가 수정되었습니다.' };
  }

  async deleteResume(userId: number, resumeId: number) {
    const resume = await this.getResume(userId, resumeId);
    await this.resumeRepository.deleteResume(resumeId);
    return { message: '이력서가 삭제되었습니다.' };
  }

  // Education 관련 메서드
  async addEducation(userId: number, resumeId: number, educationDto: EducationDto) {
    await this.getResume(userId, resumeId);
    const education = await this.resumeRepository.addEducation({
      ...educationDto,
      resumeId,
    });
    return education;
  }

  async updateEducation(userId: number, resumeId: number, educationId: number, educationDto: EducationDto) {
    await this.getResume(userId, resumeId);
    await this.resumeRepository.updateEducation(educationId, educationDto);
    return { message: '학력 정보가 수정되었습니다.' };
  }

  async deleteEducation(userId: number, resumeId: number, educationId: number) {
    await this.getResume(userId, resumeId);
    await this.resumeRepository.deleteEducation(educationId);
    return { message: '학력 정보가 삭제되었습니다.' };
  }

  // Experience 관련 메서드
  async addExperience(userId: number, resumeId: number, experienceDto: ExperienceDto) {
    await this.getResume(userId, resumeId);
    const experience = await this.resumeRepository.addExperience({
      ...experienceDto,
      resumeId,
    });
    return experience;
  }

  async updateExperience(userId: number, resumeId: number, experienceId: number, experienceDto: ExperienceDto) {
    await this.getResume(userId, resumeId);
    await this.resumeRepository.updateExperience(experienceId, experienceDto);
    return { message: '경력 정보가 수정되었습니다.' };
  }

  async deleteExperience(userId: number, resumeId: number, experienceId: number) {
    await this.getResume(userId, resumeId);
    await this.resumeRepository.deleteExperience(experienceId);
    return { message: '경력 정보가 삭제되었습니다.' };
  }

  // Skill 관련 메서드
  async addSkill(userId: number, resumeId: number, skillDto: SkillDto) {
    await this.getResume(userId, resumeId);
    const skill = await this.resumeRepository.addSkill({
      ...skillDto,
      resumeId,
    });
    return skill;
  }

  async updateSkill(userId: number, resumeId: number, skillId: number, skillDto: SkillDto) {
    await this.getResume(userId, resumeId);
    await this.resumeRepository.updateSkill(skillId, skillDto);
    return { message: '기술 정보가 수정되었습니다.' };
  }

  async deleteSkill(userId: number, resumeId: number, skillId: number) {
    await this.getResume(userId, resumeId);
    await this.resumeRepository.deleteSkill(skillId);
    return { message: '기술 정보가 삭제되었습니다.' };
  }

  // Portfolio 관련 메서드
  async uploadPortfolio(userId: number, resumeId: number, file: Express.Multer.File) {
    try {
      console.log('Portfolio upload started:', {
        userId,
        resumeId,
        fileName: file.originalname,
        fileSize: file.size
      });

      await this.getResume(userId, resumeId);

      // 한글 파일명 안전하게 처리
      const safeFilename = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const fileName = `${process.env.MINIO_RESUME}/${resumeId}/${safeFilename}`;

      // 기존 포트폴리오 검색
      const existingPortfolio = await this.resumeRepository.findPortfolioByResumeIdAndName(
        resumeId,
        safeFilename
      );

      // Minio 파일 업로드
      const fileUrl = await this.minioService.uploadFile(
        fileName,
        file.buffer,
        file.mimetype
      );

      let portfolio;
      if (existingPortfolio) {
        // 기존 포트폴리오 업데이트
        portfolio = await this.resumeRepository.updatePortfolio(existingPortfolio.id, {
          fileUrl,
          fileType: file.mimetype,
          fileSize: file.size,
          updatedAt: new Date()
        });
        console.log('Portfolio updated:', { portfolioId: existingPortfolio.id });
      } else {
        // 새 포트폴리오 생성
        portfolio = await this.resumeRepository.addPortfolio({
          resumeId,
          fileName,
          originalName: safeFilename,
          fileUrl,
          fileType: file.mimetype,
          fileSize: file.size,
        });
        console.log('New portfolio created');
      }

      return portfolio;
    } catch (error) {
      console.error('Portfolio upload failed:', {
        error: error.message,
        stack: error.stack,
        context: {
          userId,
          resumeId,
          fileName: file?.originalname
        }
      });
      throw error;
    }
  }

  async deletePortfolio(userId: number, resumeId: number, portfolioId: number) {
    try {
      // 1. 권한 확인
      await this.getResume(userId, resumeId);
      
      // 2. 포트폴리오 정보 조회
      const portfolio = await this.resumeRepository.findPortfolioById(portfolioId);
      if (!portfolio) {
        throw new NotFoundException('포트폴리오를 찾을 수 없습니다.');
      }

      // 3. Minio에서 파일 삭제
      await this.minioService.deleteFile(portfolio.fileName);

      // 4. DB에서 포트폴리오 정보 삭제
      await this.resumeRepository.deletePortfolio(portfolioId);
      
      return { message: '포트폴리오가 삭제되었습니다.' };
    } catch (error) {
      console.error('Portfolio deletion failed:', {
        error: error.message,
        context: { userId, resumeId, portfolioId }
      });
      throw error;
    }
  }
} 