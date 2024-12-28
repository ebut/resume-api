import { Test, TestingModule } from '@nestjs/testing';
import { ResumeService } from '../resume.service';
import { ResumeRepository } from '../resume.repository';
import { MinioService } from '../../minio/minio.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Readable } from 'stream';

describe('ResumeService', () => {
  let service: ResumeService;
  let repository: ResumeRepository;
  let minioService: MinioService;

  const mockResumeRepository = {
    createResume: jest.fn(),
    findResumeById: jest.fn(),
    findResumesByUserId: jest.fn(),
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
    addPortfolio: jest.fn(),
    deletePortfolio: jest.fn(),
    findPortfolioByResumeIdAndName: jest.fn(),
    findPortfolioById: jest.fn(),
    updatePortfolio: jest.fn(),
    findPortfoliosByResumeId: jest.fn(),
  };

  const mockMinioService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    getFileUrl: jest.fn(),
    getFileStream: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeService,
        {
          provide: ResumeRepository,
          useValue: mockResumeRepository,
        },
        {
          provide: MinioService,
          useValue: mockMinioService,
        },
      ],
    }).compile();

    service = module.get<ResumeService>(ResumeService);
    repository = module.get<ResumeRepository>(ResumeRepository);
    minioService = module.get<MinioService>(MinioService);
  });

  describe('createResume', () => {
    const userId = 1;
    const createResumeDto = {
      name: '신입 개발자 이력서',
      gender: '남성',
      birthDate: new Date('1990-01-01'),
      address: '서울시 강남구',
      phone: '010-1234-5678',
      jobStatus: '구직중',
    };

    it('이력서를 성공적으로 생성해야 합니다', async () => {
      const expectedResume = {
        id: 1,
        userId,
        ...createResumeDto,
      };

      mockResumeRepository.createResume.mockResolvedValue(expectedResume);

      const result = await service.createResume(userId, createResumeDto);

      expect(result).toBe(expectedResume);
      expect(mockResumeRepository.createResume).toHaveBeenCalledWith({
        ...createResumeDto,
        userId,
      });
    });
  });

  describe('getResume', () => {
    const userId = 1;
    const resumeId = 1;

    it('사용자의 이력서를 정상적으로 조회해야 합니다', async () => {
      const expectedResume = {
        id: resumeId,
        userId,
        name: '신입 개발자 이력서',
      };

      mockResumeRepository.findResumeById.mockResolvedValue(expectedResume);

      const result = await service.getResume(userId, resumeId);

      expect(result).toBe(expectedResume);
    });

    it('존재하지 않는 이력서에 대해 NotFoundException을 발생시켜야 합니다', async () => {
      mockResumeRepository.findResumeById.mockResolvedValue(null);

      await expect(service.getResume(userId, resumeId))
        .rejects.toThrow(NotFoundException);
    });

    it('다른 사용자의 이력서에 접근 시 UnauthorizedException을 발생시켜야 합니다', async () => {
      const resume = {
        id: resumeId,
        userId: 999,
        name: '다른 사용자의 이력서',
      };

      mockResumeRepository.findResumeById.mockResolvedValue(resume);

      await expect(service.getResume(userId, resumeId))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('deleteResume', () => {
    it('should delete resume and all related files', async () => {
      const userId = 1;
      const resumeId = 1;
      const mockResume = {
        id: resumeId,
        userId,
        educations: [],
        experiences: [],
        skills: [],
        portfolios: [],
      };

      mockResumeRepository.findResumeById.mockResolvedValue(mockResume);
      mockMinioService.deleteFile.mockResolvedValue(undefined);
      mockResumeRepository.deleteResume.mockResolvedValue({ message: '이력서가 삭제되었습니다.' });

      const result = await service.deleteResume(userId, resumeId);

      expect(result.message).toBe('이력서가 삭제되었습니다.');
      expect(mockResumeRepository.deleteResume).toHaveBeenCalledWith(resumeId);
    });

    it('should throw UnauthorizedException when user does not own resume', async () => {
      const userId = 1;
      const resumeId = 1;
      const mockResume = {
        id: resumeId,
        userId: 2,
        portfolios: []
      };

      mockResumeRepository.findResumeById.mockResolvedValue(mockResume);

      await expect(service.deleteResume(userId, resumeId))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('createCompleteResume', () => {
    it('should create resume with all related data', async () => {
      const userId = 1;
      const completeResumeDto = {
        basicInfo: {
          name: '홍길동의 이력서',
          gender: '남성',
          birthDate: new Date(),
          address: '서울시',
          phone: '010-1234-5678',
          jobStatus: '구직중'
        },
        educations: [{
          startDate: new Date(),
          endDate: new Date(),
          schoolName: '서울대학교',
          major: '컴퓨터공학',
          location: '서울',
          type: '4년제'
        }],
        experiences: [{
          companyName: '네이버',
          position: '개발자',
          department: '개발팀',
          jobRole: '백엔드',
          location: '판교',
          startDate: new Date(),
          endDate: new Date(),
          description: '개발 업무'
        }],
        skills: [{
          skillName: 'Node.js',
          level: '상'
        }]
      };

      const mockResume = { 
        id: 1, 
        userId, 
        ...completeResumeDto.basicInfo 
      };

      mockResumeRepository.createResume.mockResolvedValue(mockResume);
      mockResumeRepository.findResumeById.mockResolvedValue({
        ...mockResume,
        userId,
        educations: [],
        experiences: [],
        skills: []
      });

      const result = await service.createCompleteResume(userId, completeResumeDto);

      expect(result).toBeDefined();
      expect(mockResumeRepository.createResume).toHaveBeenCalled();
      expect(mockResumeRepository.addEducation).toHaveBeenCalled();
      expect(mockResumeRepository.addExperience).toHaveBeenCalled();
      expect(mockResumeRepository.addSkill).toHaveBeenCalled();
    });
  });

  describe('updateResume', () => {
    const userId = 1;
    const resumeId = 1;
    const updateDto = {
      name: '수정된 이력서',
      jobStatus: '재직중'
    };

    it('should update resume successfully', async () => {
      mockResumeRepository.findResumeById.mockResolvedValue({ id: resumeId, userId });
      mockResumeRepository.updateResume.mockResolvedValue({ message: '이력서가 수정되었습니다.' });

      const result = await service.updateResume(userId, resumeId, updateDto);

      expect(result.message).toBe('이력서가 수정되었습니다.');
      expect(mockResumeRepository.updateResume).toHaveBeenCalledWith(resumeId, updateDto);
    });

    it('should throw UnauthorizedException when updating other user\'s resume', async () => {
      mockResumeRepository.findResumeById.mockResolvedValue({ id: resumeId, userId: 999 });

      await expect(service.updateResume(userId, resumeId, updateDto))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('addEducation', () => {
    const userId = 1;
    const resumeId = 1;
    const educationDto = {
      startDate: new Date(),
      endDate: new Date(),
      schoolName: '서울대학교',
      major: '컴퓨터공학',
      location: '서울',
      type: '4년제'
    };

    it('should add education successfully', async () => {
      mockResumeRepository.findResumeById.mockResolvedValue({ id: resumeId, userId });
      mockResumeRepository.addEducation.mockResolvedValue({ id: 1, ...educationDto });

      const result = await service.addEducation(userId, resumeId, educationDto);

      expect(result).toBeDefined();
      expect(mockResumeRepository.addEducation).toHaveBeenCalledWith({
        ...educationDto,
        resumeId
      });
    });
  });

  describe('addExperience', () => {
    const userId = 1;
    const resumeId = 1;
    const experienceDto = {
      companyName: '네이버',
      position: '개발자',
      department: '개발팀',
      jobRole: '백엔드',
      location: '판교',
      startDate: new Date(),
      endDate: new Date(),
      description: '개발 업무'
    };

    it('should add experience successfully', async () => {
      mockResumeRepository.findResumeById.mockResolvedValue({ id: resumeId, userId });
      mockResumeRepository.addExperience.mockResolvedValue({ id: 1, ...experienceDto });

      const result = await service.addExperience(userId, resumeId, experienceDto);

      expect(result).toBeDefined();
      expect(mockResumeRepository.addExperience).toHaveBeenCalledWith({
        ...experienceDto,
        resumeId
      });
    });
  });

  describe('updateCompleteResume', () => {
    const userId = 1;
    const resumeId = 1;
    const completeResumeDto = {
      basicInfo: {
        name: '수정된 이력서',
        gender: '남성',
        birthDate: new Date(),
        address: '서울시',
        phone: '010-1234-5678',
        jobStatus: '구직중'
      },
      educations: [{
        startDate: new Date(),
        endDate: new Date(),
        schoolName: '서울대학교',
        major: '컴퓨터공학',
        location: '서울',
        type: '4년제'
      }],
      skills: [{
        skillName: 'Node.js',
        level: '상'
      }]
    };

    it('should update complete resume successfully', async () => {
      const mockResume = {
        id: resumeId,
        userId,
        educations: [{ id: 1 }],
        experiences: [],
        skills: [{ id: 1 }]
      };

      mockResumeRepository.findResumeById.mockResolvedValue(mockResume);
      mockResumeRepository.updateResume.mockResolvedValue({ message: '이력서가 수정되었습니다.' });

      const result = await service.updateCompleteResume(userId, resumeId, completeResumeDto);

      expect(result).toBeDefined();
      expect(mockResumeRepository.updateResume).toHaveBeenCalled();
      expect(mockResumeRepository.deleteEducation).toHaveBeenCalled();
      expect(mockResumeRepository.deleteSkill).toHaveBeenCalled();
      expect(mockResumeRepository.addEducation).toHaveBeenCalled();
      expect(mockResumeRepository.addSkill).toHaveBeenCalled();
    });
  });

  describe('downloadPortfolio', () => {
    const userId = 1;
    const resumeId = 1;
    const portfolioId = 1;

    it('should throw NotFoundException when portfolio not found', async () => {
      mockResumeRepository.findResumeById.mockResolvedValue({ id: resumeId, userId });
      mockResumeRepository.findPortfolioById.mockResolvedValue(null);

      await expect(service.downloadPortfolio(userId, resumeId, portfolioId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('createCompleteResumeWithFiles', () => {
    const userId = 1;
    const completeResumeDto = {
      basicInfo: {
        name: '홍길동의 이력서',
        gender: '남성',
        birthDate: new Date(),
        address: '서울시',
        phone: '010-1234-5678',
        jobStatus: '구직중'
      },
      educations: [{
        startDate: new Date(),
        endDate: new Date(),
        schoolName: '서울대학교',
        major: '컴퓨터공학',
        location: '서울',
        type: '4년제'
      }]
    };

    const mockFiles = [
      {
        originalname: 'test1.pdf',
        buffer: Buffer.from('test1'),
        mimetype: 'application/pdf',
        size: 1024,
      },
      {
        originalname: 'test2.pdf',
        buffer: Buffer.from('test2'),
        mimetype: 'application/pdf',
        size: 1024,
      }
    ] as Express.Multer.File[];
    
    it('should create resume without files', async () => {
      const userId = 1;
      const mockResume = { 
        id: 1, 
        userId, 
        ...completeResumeDto.basicInfo 
      };

      mockResumeRepository.createResume.mockResolvedValue(mockResume);
      mockResumeRepository.findResumeById.mockResolvedValue({
        ...mockResume,
        userId,
        educations: [],
        experiences: [],
        skills: []
      });

      const result = await service.createCompleteResumeWithFiles(userId, completeResumeDto, []);

      expect(result).toBeDefined();
      expect(mockResumeRepository.createResume).toHaveBeenCalled();
      expect(mockMinioService.uploadFile).not.toHaveBeenCalled();
    });
  });

  describe('error cases', () => {
    it('should handle database errors', async () => {
      const userId = 1;
      const resumeId = 1;
      
      mockResumeRepository.findResumeById.mockRejectedValue(new Error('DB Error'));

      await expect(service.getResume(userId, resumeId))
        .rejects.toThrow('DB Error');
    });
  });

  describe('integration tests', () => {
    it('should handle complete resume workflow', async () => {
      // 전체 워크플로우 테스트
    });
  });
}); 