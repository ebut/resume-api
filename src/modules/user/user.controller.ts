import { Controller, Post, Body, UseGuards, Get, Put, Delete, Res, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { CookieOptions, Response } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('사용자')
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  async register(@Body() registerDto: RegisterDto) {
    return await this.userService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.userService.login(loginDto);
    
    // 쿠키 설정
    if (result.setCookies?.refreshToken) {
      const { name, value, options } = result.setCookies.refreshToken;
      response.cookie(name, value, options as CookieOptions);
    }

    // 클라이언트에게 액세스 토큰을 반환
    return {
      accessToken: result.tokens.accessToken,
      tokenType: 'Bearer'
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response
  ) {
    await this.userService.logout(user.id);
    
    // 쿠키 제거
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    return { message: '로그아웃되었습니다.' };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiResponse({ status: 200, description: '비밀번호 변경 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return await this.userService.changePassword(user.id, changePasswordDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ status: 200, description: '회원 탈퇴 성공' })
  async withdraw(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response
  ) {
    await this.userService.withdraw(user.id);
    
    // 쿠키 제거
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }
} 