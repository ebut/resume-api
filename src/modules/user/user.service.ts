import { Injectable, UnauthorizedException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './user.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JWT_DEFAULTS, TOKEN_CONSTANTS, jwtConfig, jwtRefreshConfig } from '../../config/jwt.config';
import { parseTimeToSeconds } from '../../common/utils/time.util';
import { ConfigService } from '@nestjs/config';
import { ResumeService } from '../resume/resume.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => ResumeService))
    private readonly resumeService: ResumeService,
  ) {}
  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;
    
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    return this.generateTokens(user);
  }

  private async generateTokens(user: any) {
    const payload = { id: user.id, email: user.email };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1h'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    await this.userRepository.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    // 로그인 시에는 저장된 해시된 비밀번호와 비교해야 합니다
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // bcrypt.compare를 사용하여 입력된 비밀번호와 저장된 해시를 비교
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 보안을 위해 비밀번호 정보를 응답에서 제거
    delete user.password;
    
    // 토큰 생성
    const tokens = await this.generateTokens(user);

    // 토큰을 쿠키에 저장하기 위해 응답 객체를 포함하여 반환
    return {
      tokens,
      setCookies: {
        refreshToken: {
          name: 'refreshToken',
          value: tokens.refreshToken,
          options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: parseTimeToSeconds(
              process.env.JWT_REFRESH_EXPIRES_IN,
              JWT_DEFAULTS.REFRESH_TOKEN_EXPIRES,
            ) * 1000,
            path: '/'
          }
        }
      }
    };
  }

  async logout(userId: number) {
    // DB에서 refreshToken 제거
    await this.userRepository.updateRefreshToken(userId, null);
    
    return { message: '로그아웃되었습니다.' };
  }

  async validateAndRefreshTokens(userId: number, refreshToken: string) {
    try {
      // 1. 리프레시 토큰 검증
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // 2. 사용자 조회 및 저장된 리프레시 토큰과 비교
      const user = await this.userRepository.findById(userId);
      if (!user || user.refreshToken !== refreshToken) {
        return null;
      }

      // 3. 리프레시 토큰의 만료 시간 확인
      const tokenExp = new Date(payload.exp * 1000);
      const now = new Date();
      const timeUntilExp = tokenExp.getTime() - now.getTime();
      
      if (timeUntilExp < TOKEN_CONSTANTS.REFRESH_TOKEN_REFRESH_THRESHOLD) {
        return this.generateTokens(user);
      }

      // 5. 그렇지 않으면 액세스 토큰만 새로 발급
      const accessToken = await this.jwtService.signAsync(
        { id: user.id, email: user.email },
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return {
        accessToken,
        refreshToken // 기존 리프레시 토큰 유지
      };
    } catch (error) {
      return null; // 토큰 검증 실패시 null 반환
    }
  }

  async withdraw(userId: number) {
    try {
      // 1. 사용자의 모든 이력서 조회
      const resumes = await this.resumeService.getUserResumes(userId);
      
      // 2. 각 이력서와 관련 파일 삭제
      if (resumes.length) {
        await Promise.all(
          resumes.map(resume => 
            this.resumeService.deleteResume(userId, resume.id)
          )
        );
      }

      // 3. 사용자 정보 삭제
      await this.userRepository.deleteUser(userId);

      return { message: '회원 탈퇴가 완료되었습니다.' };
    } catch (error) {
      console.error('User withdrawal failed:', {
        error: error.message,
        userId
      });
      throw new Error('회원 탈퇴 처리 중 오류가 발생했습니다.');
    }
  }
} 