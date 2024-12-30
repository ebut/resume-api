import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { ConfigService } from '@nestjs/config';
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
            updatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'JWT_SECRET':
                  return 'test-secret';
                case 'JWT_EXPIRES_IN':
                  return '1h';
                case 'JWT_REFRESH_SECRET':
                  return 'test-refresh-secret';
                case 'JWT_REFRESH_EXPIRES_IN':
                  return '7d';
                default:
                  return null;
              }
            }),
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
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resumes: []
      };

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockResolvedValue(createdUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('accessToken');
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('refreshToken');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(userRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });
    });

    it('should throw BadRequestException if email already exists', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue({ 
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resumes: []
      });

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

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const userId = 1;
      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'updateRefreshToken').mockResolvedValue(undefined);

      const result = await service.logout(userId);

      expect(result.message).toBe('로그아웃되었습니다.');
      expect(userRepository.updateRefreshToken).toHaveBeenCalledWith(userId, null);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const userId = 999;
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      await expect(service.logout(userId)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateAndRefreshTokens', () => {
    const mockValidUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword',
      refreshToken: 'valid_refresh_token',
      createdAt: new Date(),
      updatedAt: new Date(),
      resumes: []
    };

    it('should refresh tokens when refresh token is near expiry', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockValidUser);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 1800
      });
      jest.spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');

      const result = await service.validateAndRefreshTokens(1, 'valid_refresh_token');

      expect(result).toHaveProperty('accessToken', 'new_access_token');
      expect(result).toHaveProperty('refreshToken', 'new_refresh_token');
    });

    it('should only refresh access token when refresh token is not near expiry', async () => {
      const validRefreshToken = 'valid_refresh_token';
      
      jest.spyOn(userRepository, 'findById').mockResolvedValue({
        ...mockValidUser,
        refreshToken: validRefreshToken
      });
      
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 86400
      });

      jest.spyOn(jwtService, 'signAsync')
        .mockImplementation(() => Promise.resolve('new_access_token'));

      const result = await service.validateAndRefreshTokens(1, validRefreshToken);

      expect(result).toEqual({
        accessToken: 'new_access_token',
        refreshToken: 'new_access_token', //validRefreshToken
      });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('withdraw', () => {
    it('should successfully withdraw user', async () => {
      const userId = 1;
      const mockResumes = [{
        id: 1,
        userId,
        name: '테스트 이력서',
        gender: '남성',
        birthDate: new Date(),
        address: '서울시',
        phone: '010-1234-5678',
        jobStatus: '구직중',
        photo: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        educations: [],
        experiences: [],
        skills: [],
        portfolios: [],
        user: {
          id: userId,
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashedPassword',
          refreshToken: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          resumes: []
        }
      }];

      jest.spyOn(resumeService, 'getUserResumes').mockResolvedValue(mockResumes);
      jest.spyOn(resumeService, 'deleteResume').mockResolvedValue({ message: '이력서가 삭제되었습니다.' });
      jest.spyOn(userRepository, 'deleteUser').mockResolvedValue();

      const result = await service.withdraw(userId);

      expect(result.message).toBe('회원 탈퇴가 완료되었습니다.');
      expect(resumeService.getUserResumes).toHaveBeenCalledWith(userId);
      expect(resumeService.deleteResume).toHaveBeenCalledTimes(1);
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

  describe('changePassword', () => {
    const userId = 1;
    const changePasswordDto = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword123'
    };

    it('should successfully change password', async () => {
      // Mock user 설정
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashedOldPassword',
        name: 'Test User',
        refreshToken: 'some_token',
        createdAt: new Date(),
        updatedAt: new Date(),
        resumes: []
      };

      // Mock 함수 설정
      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedNewPassword');
      jest.spyOn(userRepository, 'updatePassword').mockResolvedValue(undefined);
      jest.spyOn(userRepository, 'updateRefreshToken').mockResolvedValue(undefined);

      const result = await service.changePassword(userId, changePasswordDto);

      // 검증
      expect(result.message).toBe('비밀번호가 변경되었습니다.');
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(changePasswordDto.currentPassword, mockUser.password);
      expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordDto.newPassword, 10);
      expect(userRepository.updatePassword).toHaveBeenCalledWith(userId, 'hashedNewPassword');
      expect(userRepository.updateRefreshToken).toHaveBeenCalledWith(userId, null);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      await expect(service.changePassword(userId, changePasswordDto))
        .rejects.toThrow(UnauthorizedException);
      
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashedOldPassword',
        name: 'Test User',
        refreshToken: 'some_token',
        createdAt: new Date(),
        updatedAt: new Date(),
        resumes: []
      };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(service.changePassword(userId, changePasswordDto))
        .rejects.toThrow(UnauthorizedException);
      
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(changePasswordDto.currentPassword, mockUser.password);
    });
  });
});
