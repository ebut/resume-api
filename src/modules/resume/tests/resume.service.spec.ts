import { Test, TestingModule } from '@nestjs/testing';
import { ResumeService } from '../resume.service';
import { ResumeRepository } from '../resume.repository';
import { MinioService } from '../../minio/minio.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

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

    it('should create resume successfully', async () => {
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

    it('should return resume if exists and belongs to user', async () => {
      const expectedResume = {
        id: resumeId,
        userId,
        name: '신입 개발자 이력서',
      };

      mockResumeRepository.findResumeById.mockResolvedValue(expectedResume);

      const result = await service.getResume(userId, resumeId);

      expect(result).toBe(expectedResume);
    });

    it('should throw NotFoundException if resume does not exist', async () => {
      mockResumeRepository.findResumeById.mockResolvedValue(null);

      await expect(service.getResume(userId, resumeId))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if resume belongs to different user', async () => {
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

  describe('uploadPortfolio', () => {
    const userId = 1;
    const resumeId = 1;
    const mockFile = {
      originalname: 'test.pdf',
      buffer: Buffer.from('test'),
      mimetype: 'application/pdf',
      size: 1024,
    } as Express.Multer.File;

    it('should upload portfolio file successfully', async () => {
      const fileUrl = 'http://minio-server/bucket/file.pdf';
      const expectedPortfolio = {
        id: 1,
        resumeId,
        fileName: `${resumeId}/test.pdf`,
        originalName: 'test.pdf',
        fileUrl,
        fileType: 'application/pdf',
        fileSize: 1024,
      };

      mockResumeRepository.findResumeById.mockResolvedValue({ id: resumeId, userId });
      mockMinioService.uploadFile.mockResolvedValue(fileUrl);
      mockResumeRepository.addPortfolio.mockResolvedValue(expectedPortfolio);

      const result = await service.uploadPortfolio(userId, resumeId, mockFile);

      expect(result).toBe(expectedPortfolio);
      expect(mockMinioService.uploadFile).toHaveBeenCalled();
      expect(mockResumeRepository.addPortfolio).toHaveBeenCalled();
    });
  });
}); 