import { Test, TestingModule } from '@nestjs/testing';
import { ResumeController } from '../resume.controller';
import { ResumeService } from '../resume.service';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumeController],
      providers: [
        {
          provide: ResumeService,
          useValue: mockResumeService,
        },
      ],
    }).compile();

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
      const expectedResult = {
        id: 1,
        userId: mockUser.id,
        ...createResumeDto,
      };

      mockResumeService.createResume.mockResolvedValue(expectedResult);

      const result = await controller.createResume(mockUser, createResumeDto);

      expect(result).toBe(expectedResult);
      expect(service.createResume).toHaveBeenCalledWith(mockUser.id, createResumeDto);
    });
  });

  describe('getResumes', () => {
    it('should return all resumes for user', async () => {
      const expectedResumes = [
        { id: 1, userId: mockUser.id, name: '이력서 1' },
        { id: 2, userId: mockUser.id, name: '이력서 2' },
      ];

      mockResumeService.getUserResumes.mockResolvedValue(expectedResumes);

      const result = await controller.getResumes(mockUser);

      expect(result).toBe(expectedResumes);
      expect(service.getUserResumes).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('uploadPortfolio', () => {
    it('should upload portfolio file', async () => {
      const resumeId = 1;
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test'),
        mimetype: 'application/pdf',
      } as Express.Multer.File;
      const expectedResult = {
        id: 1,
        resumeId,
        fileName: 'test.pdf',
        fileUrl: 'http://example.com/test.pdf',
      };

      mockResumeService.uploadPortfolio.mockResolvedValue(expectedResult);

      const result = await controller.uploadPortfolio(mockUser, resumeId, mockFile);

      expect(result).toBe(expectedResult);
      expect(service.uploadPortfolio).toHaveBeenCalledWith(mockUser.id, resumeId, mockFile);
    });
  });
}); 