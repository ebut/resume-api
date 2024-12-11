import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { Response } from 'express';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    status: jest.fn().mockReturnThis(),
    sendStatus: jest.fn(),
    links: jest.fn(),
    send: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: '홍길동',
      };
      const expectedResult = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      mockUserService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toBe(expectedResult);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      mockUserService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto, mockResponse);

      expect(result).toBe(expectedResult);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });
}); 