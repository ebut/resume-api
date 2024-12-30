import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { Response } from 'express';
import { ChangePasswordDto } from '../dto/change-password.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    changePassword: jest.fn(),
    withdraw: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    status: jest.fn().mockReturnThis(),
    sendStatus: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;

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
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: '홍길동',
      };
      const expectedResult = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      mockUserService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toBe(expectedResult);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login successfully and set cookies', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const loginResponse = {
        tokens: {
          accessToken: 'access_token',
          refreshToken: 'refresh_token',
        },
        setCookies: {
          refreshToken: {
            name: 'refreshToken',
            value: 'refresh_token',
            options: {
              httpOnly: true,
              secure: false,
              sameSite: 'strict',
              maxAge: 604800000,
              path: '/',
            },
          },
        },
      };

      mockUserService.login.mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto, mockResponse);

      expect(result).toEqual({ accessToken: loginResponse.tokens.accessToken, tokenType: 'Bearer' });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh_token',
        expect.any(Object)
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear cookies', async () => {
      mockUserService.logout.mockResolvedValue({ message: '로그아웃되었습니다.' });

      const result = await controller.logout(mockUser, mockResponse);

      expect(result.message).toBe('로그아웃되었습니다.');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };
      const expectedResult = { message: '비밀번호가 변경되었습니다.' };

      mockUserService.changePassword.mockResolvedValue(expectedResult);

      const result = await controller.changePassword(mockUser, changePasswordDto);

      expect(result).toBe(expectedResult);
      expect(service.changePassword).toHaveBeenCalledWith(mockUser.id, changePasswordDto);
    });
  });

  describe('withdraw', () => {
    it('should withdraw user successfully', async () => {
      const expectedResult = { message: '회원 탈퇴가 완료되었습니다.' };

      mockUserService.withdraw.mockResolvedValue(expectedResult);

      const result = await controller.withdraw(mockUser, mockResponse);

      expect(result).toStrictEqual(expectedResult);
      expect(service.withdraw).toHaveBeenCalledWith(mockUser.id);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
    });
  });
}); 