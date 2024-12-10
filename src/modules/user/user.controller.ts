import { Controller, Post, Body, UseGuards, Get, Put, Delete, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { CookieOptions, Response } from 'express';

@ApiTags('사용자')
@Controller('api/auth')
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

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(@CurrentUser() user: User) {
    return await this.userService.logout(user.id);
  }
} 