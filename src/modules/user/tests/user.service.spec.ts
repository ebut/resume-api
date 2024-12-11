import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let jwtService: JwtService;

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
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock_token'),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
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
}); 