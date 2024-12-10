import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;
  let jwtService: JwtService;

  const mockUserRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updateRefreshToken: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
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
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with correct credentials', async () => {
      const user = {
        id: 1,
        email: loginDto.email,
        password: await bcrypt.hash(loginDto.password, 10),
      };

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValueOnce('accessToken');
      mockJwtService.signAsync.mockResolvedValueOnce('refreshToken');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException with incorrect password', async () => {
      const user = {
        id: 1,
        email: loginDto.email,
        password: await bcrypt.hash('differentPassword', 10),
      };

      mockUserRepository.findByEmail.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with non-existent email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
}); 