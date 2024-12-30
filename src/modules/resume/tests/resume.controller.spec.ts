import { Test, TestingModule } from '@nestjs/testing';
import { ResumeController } from '../resume.controller';
import { ResumeService } from '../resume.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

describe('ResumeController', () => {
  let controller: ResumeController;
  let service: ResumeService;

  const mockResumeService = {
    createResume: jest.fn(),
    getResume: jest.fn(),
    getUserResumes: jest.fn(),
    updateResume: jest.fn(),
    deleteResume: jest.fn(),
    addEducation: jest.fn(),
    updateEducation: jest.fn(),
    deleteEducation: jest.fn(),
    addExperience: jest.fn(),
    updateExperience: jest.fn(),
    deleteExperience: jest.fn(),
    addSkill: jest.fn(),
    updateSkill: jest.fn(),
    deleteSkill: jest.fn(),
    uploadPortfolio: jest.fn(),
    deletePortfolio: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    resumes: []
  };

  const mockResume = {
    id: 1,
    userId: mockUser.id,
    name: '신입 개발자 이력서',
    gender: '남성',
    birthDate: new Date('1990-01-01'),
    address: '서울시 강남구',
    phone: '010-1234-5678',
    jobStatus: '구직중',
    educations: [],
    experiences: [],
    skills: [],
    portfolios: []
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumeController],
      providers: [
        {
          provide: ResumeService,
          useValue: mockResumeService
        }
      ]
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ResumeController>(ResumeController);
    service = module.get<ResumeService>(ResumeService);
  });

  describe('createResume', () => {
    it('should create a new resume', async () => {
      const createResumeDto = {
        name: '신입 개발자 이력서',
        gender: '남성',
        birthDate: new Date('1990-01-01'),
        address: '서울시 강남구',
        phone: '010-1234-5678',
        jobStatus: '구직중',
      };

      mockResumeService.createResume.mockResolvedValue(mockResume);

      const result = await controller.createResume(mockUser, createResumeDto);

      expect(result).toBe(mockResume);
      expect(service.createResume).toHaveBeenCalledWith(mockUser.id, createResumeDto);
    });
  });

  describe('getResumes', () => {
    it('should return all resumes for user', async () => {
      const mockResumes = [mockResume];
      mockResumeService.getUserResumes.mockResolvedValue(mockResumes);

      const result = await controller.getResumes(mockUser);

      expect(result).toBe(mockResumes);
      expect(service.getUserResumes).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getResume', () => {
    it('should return a specific resume', async () => {
      mockResumeService.getResume.mockResolvedValue(mockResume);

      const result = await controller.getResume(mockUser, mockResume.id);

      expect(result).toBe(mockResume);
      expect(service.getResume).toHaveBeenCalledWith(mockUser.id, mockResume.id);
    });
  });

  describe('updateResume', () => {
    it('should update a resume', async () => {
      const updateResumeDto = {
        name: '수정된 이력서',
        gender: '남성',
        birthDate: new Date('1990-01-01'),
        address: '서울시 강남구',
        phone: '010-1234-5678',
        jobStatus: '재직중',
      };

      mockResumeService.updateResume.mockResolvedValue({
        ...mockResume,
        ...updateResumeDto
      });

      const result = await controller.updateResume(mockUser, mockResume.id, updateResumeDto);

      expect(result).toEqual(expect.objectContaining(updateResumeDto));
      expect(service.updateResume).toHaveBeenCalledWith(mockUser.id, mockResume.id, updateResumeDto);
    });
  });

  describe('deleteResume', () => {
    it('should delete a resume', async () => {
      const expectedResponse = { message: '이력서가 삭제되었습니다.' };
      mockResumeService.deleteResume.mockResolvedValue(expectedResponse);

      const result = await controller.deleteResume(mockUser, mockResume.id);

      expect(result).toBe(expectedResponse);
      expect(service.deleteResume).toHaveBeenCalledWith(mockUser.id, mockResume.id);
    });
  });

  describe('Education endpoints', () => {
    const mockEducationResponse = {
      id: 1,
      schoolName: '서울대학교',
      major: '컴퓨터공학',
      type: '대학교',
      location: '서울특별시',
      startDate: new Date('2010-03-01'),
      endDate: new Date('2014-02-28'),
      gpa: '4.0',
      maxGpa: '4.5'
    };

    const mockEducationDto = {
      schoolName: '서울대학교',
      major: '컴퓨터공학',
      type: '대학교',
      location: '서울특별시',
      startDate: new Date('2010-03-01'),
      endDate: new Date('2014-02-28'),
      gpa: '4.0',
      maxGpa: '4.5'
    };

    it('should add education', async () => {
      mockResumeService.addEducation.mockResolvedValue(mockEducationResponse);

      const result = await controller.addEducation(mockUser, mockResume.id, mockEducationDto);

      expect(result).toBe(mockEducationResponse);
      expect(service.addEducation).toHaveBeenCalledWith(mockUser.id, mockResume.id, mockEducationDto);
    });

    it('should update education', async () => {
      const updateEducationDto = {
        schoolName: '서울대학교',
        major: '컴퓨터공학',
        type: '대학교',
        location: '서울특별시',
        startDate: new Date('2010-03-01'),
        endDate: new Date('2014-02-28'),
        gpa: '4.2',
        maxGpa: '4.5'
      };

      mockResumeService.updateEducation.mockResolvedValue({
        ...mockEducationResponse,
        ...updateEducationDto
      });

      const result = await controller.updateEducation(
        mockUser,
        mockResume.id,
        mockEducationResponse.id,
        updateEducationDto
      );

      expect(result).toEqual(expect.objectContaining(updateEducationDto));
      expect(service.updateEducation).toHaveBeenCalledWith(
        mockUser.id,
        mockResume.id,
        mockEducationResponse.id,
        updateEducationDto
      );
    });

    it('should delete education', async () => {
      const expectedResponse = { message: '학력 정보가 삭제되었습니다.' };
      mockResumeService.deleteEducation.mockResolvedValue(expectedResponse);

      const result = await controller.deleteEducation(
        mockUser,
        mockResume.id,
        mockEducationResponse.id
      );

      expect(result).toBe(expectedResponse);
      expect(service.deleteEducation).toHaveBeenCalledWith(
        mockUser.id,
        mockResume.id,
        mockEducationResponse.id
      );
    });
  });

  describe('Experience endpoints', () => {
    const mockExperienceResponse = {
      id: 1,
      companyName: '테크 컴퍼니',
      department: '개발팀',
      jobRole: '백엔드 개발자',
      position: '시니어 개발자',
      location: '서울시 강남구',
      startDate: new Date('2014-03-01'),
      endDate: new Date('2018-02-28'),
      description: '웹 애플리케이션 개발'
    };

    const mockExperienceDto = {
      companyName: '테크 컴퍼니',
      department: '개발팀',
      jobRole: '백엔드 개발자',
      position: '시니어 개발자',
      location: '서울시 강남구',
      startDate: new Date('2014-03-01'),
      endDate: new Date('2018-02-28'),
      description: '웹 애플리케이션 개발'
    };

    it('should add experience', async () => {
      mockResumeService.addExperience.mockResolvedValue(mockExperienceResponse);

      const result = await controller.addExperience(mockUser, mockResume.id, mockExperienceDto);

      expect(result).toBe(mockExperienceResponse);
      expect(service.addExperience).toHaveBeenCalledWith(mockUser.id, mockResume.id, mockExperienceDto);
    });

    it('should update experience', async () => {
      const updateExperienceDto = {
        companyName: '테크 컴퍼니',
        department: '개발팀',
        jobRole: '백엔드 개발자',
        position: '리드 개발자',
        location: '서울시 강남구',
        startDate: new Date('2014-03-01'),
        endDate: new Date('2018-02-28'),
        description: '웹 애플리케이션 개발 및 팀 리드'
      };

      mockResumeService.updateExperience.mockResolvedValue({
        ...mockExperienceResponse,
        ...updateExperienceDto
      });

      const result = await controller.updateExperience(
        mockUser,
        mockResume.id,
        mockExperienceResponse.id,
        updateExperienceDto
      );

      expect(result).toEqual(expect.objectContaining(updateExperienceDto));
      expect(service.updateExperience).toHaveBeenCalledWith(
        mockUser.id,
        mockResume.id,
        mockExperienceResponse.id,
        updateExperienceDto
      );
    });

    it('should delete experience', async () => {
      const expectedResponse = { message: '경력 정보가 삭제되었습니다.' };
      mockResumeService.deleteExperience.mockResolvedValue(expectedResponse);

      const result = await controller.deleteExperience(
        mockUser,
        mockResume.id,
        mockExperienceResponse.id
      );

      expect(result).toBe(expectedResponse);
      expect(service.deleteExperience).toHaveBeenCalledWith(
        mockUser.id,
        mockResume.id,
        mockExperienceResponse.id
      );
    });
  });

  describe('Skill endpoints', () => {
    const mockSkillResponse = {
      id: 1,
      skillName: 'JavaScript',
      level: '상',
      category: '프로그래밍 언어'
    };

    const mockSkillDto = {
      skillName: 'JavaScript',
      level: '상',
      category: '프로그래밍 언어'
    };

    it('should add skill', async () => {
      mockResumeService.addSkill.mockResolvedValue(mockSkillResponse);

      const result = await controller.addSkill(mockUser, mockResume.id, mockSkillDto);

      expect(result).toBe(mockSkillResponse);
      expect(service.addSkill).toHaveBeenCalledWith(mockUser.id, mockResume.id, mockSkillDto);
    });

    it('should update skill', async () => {
      const updateSkillDto = {
        skillName: 'JavaScript',
        level: '최상',
        category: '프로그래밍 언어'
      };

      mockResumeService.updateSkill.mockResolvedValue({
        ...mockSkillResponse,
        ...updateSkillDto
      });

      const result = await controller.updateSkill(
        mockUser,
        mockResume.id,
        mockSkillResponse.id,
        updateSkillDto
      );

      expect(result).toEqual(expect.objectContaining(updateSkillDto));
      expect(service.updateSkill).toHaveBeenCalledWith(
        mockUser.id,
        mockResume.id,
        mockSkillResponse.id,
        updateSkillDto
      );
    });

    it('should delete skill', async () => {
      const expectedResponse = { message: '스킬이 삭제되었습니다.' };
      mockResumeService.deleteSkill.mockResolvedValue(expectedResponse);

      const result = await controller.deleteSkill(
        mockUser,
        mockResume.id,
        mockSkillResponse.id
      );

      expect(result).toBe(expectedResponse);
      expect(service.deleteSkill).toHaveBeenCalledWith(
        mockUser.id,
        mockResume.id,
        mockSkillResponse.id
      );
    });
  });

  describe('Portfolio endpoints', () => {
    const mockFile = {
      originalname: 'portfolio.pdf',
      buffer: Buffer.from('test'),
      mimetype: 'application/pdf'
    };

    it('should upload portfolio', async () => {
      const expectedResponse = {
        id: 1,
        name: 'portfolio.pdf',
        url: 'https://example.com/portfolio.pdf'
      };

      mockResumeService.uploadPortfolio.mockResolvedValue(expectedResponse);

      const result = await controller.uploadPortfolio(
        mockUser,updateEducationDto
        mockResume.id,
        mockFile as Express.Multer.File
      );

      expect(result).toBe(expectedResponse);
      expect(service.uploadPortfolio).toHaveBeenCalledWith(
        mockUser.id,
        mockResume.id,
        mockFile
      );
    });

    it('should delete portfolio', async () => {
      const portfolioId = 1;
      const expectedResponse = { message: '포트폴리오가 삭제되었습니다.' };
      
      mockResumeService.deletePortfolio.mockResolvedValue(expectedResponse);

      const result = await controller.deletePortfolio(
        mockUser,
        mockResume.id,
        portfolioId
      );

      expect(result).toBe(expectedResponse);
      expect(service.deletePortfolio).toHaveBeenCalledWith(
        mockUser.id,
        mockResume.id,
        portfolioId
      );
    });
  });
}); 