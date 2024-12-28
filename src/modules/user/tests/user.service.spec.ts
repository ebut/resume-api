import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ResumeService } from '../../resume/resume.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let resumeService: ResumeService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$abcdefghijklmnopqrstuvwxyz',
    name: 'Test User',
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    resumes: []
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            updateRefreshToken: jest.fn(),
            findById: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock_token'),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ResumeService,
          useValue: {
            getUserResumes: jest.fn(),
            deleteResume: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
    resumeService = module.get<ResumeService>(ResumeService);
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: '홍길동',
    };

    it('should register a new user successfully', async () => {
      const hashedPassword = 'hashedPassword';
      const createdUser = {
        id: 1,
        ...registerDto,
        password: hashedPassword,
      };

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(createdUser);
      mockJwtService.signAsync.mockResolvedValueOnce('accessToken');
      mockJwtService.signAsync.mockResolvedValueOnce('refreshToken');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({ id: 1 });

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock findByEmail to return a user
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(mockUser);
      
      // Mock bcrypt compare
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      
      // Mock JWT sign
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mock_token');

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should fail with invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should fail with non-existent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('withdraw', () => {
    it('should successfully withdraw user', async () => {
      const userId = 1;
      const mockResumes = [
        { id: 1, userId, portfolios: [] },
        { id: 2, userId, portfolios: [] }
      ];

      jest.spyOn(resumeService, 'getUserResumes').mockResolvedValue(mockResumes);
      jest.spyOn(resumeService, 'deleteResume').mockResolvedValue({ message: '이력서가 삭제되었습니다.' });
      jest.spyOn(userRepository, 'deleteUser').mockResolvedValue();

      const result = await service.withdraw(userId);

      expect(result.message).toBe('회원 탈퇴가 완료되었습니다.');
      expect(resumeService.getUserResumes).toHaveBeenCalledWith(userId);
      expect(resumeService.deleteResume).toHaveBeenCalledTimes(2);
      expect(userRepository.deleteUser).toHaveBeenCalledWith(userId);
    });

    it('should handle withdrawal with no resumes', async () => {
      const userId = 1;
      jest.spyOn(resumeService, 'getUserResumes').mockResolvedValue([]);
      jest.spyOn(userRepository, 'deleteUser').mockResolvedValue();

      const result = await service.withdraw(userId);

      expect(result.message).toBe('회원 탈퇴가 완료되었습니다.');
      expect(resumeService.deleteResume).not.toHaveBeenCalled();
    });
  });

  describe('validateAndRefreshTokens', () => {
    it('should refresh tokens when refresh token is near expiry', async () => {
      const userId = 1;
      const refreshToken = 'old_refresh_token';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        refreshToken
      };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        id: userId,
        exp: Math.floor(Date.now() / 1000) + 1800 // 30분 후 만료
      });

      const result = await service.validateAndRefreshTokens(userId, refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.refreshToken).not.toBe(refreshToken);
    });

    it('should only refresh access token when refresh token is not near expiry', async () => {
      const userId = 1;
      const refreshToken = 'valid_refresh_token';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        refreshToken
      };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        id: userId,
        exp: Math.floor(Date.now() / 1000) + 86400 // 24시간 후 만료
      });

      const result = await service.validateAndRefreshTokens(userId, refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result.refreshToken).toBe(refreshToken);
    });
  });
}); 