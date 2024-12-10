import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './user.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { TOKEN_CONSTANTS } from '../../config/jwt.config';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
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
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN, // 1h로 설정됨
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
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
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
            path: '/'
          }
        }
      }
    };
  }

  // async refreshToken(refreshToken: string) {
  //   try {
  //     // 리프레시 토큰 검증
  //     const payload = await this.jwtService.verifyAsync(refreshToken, {
  //       secret: process.env.JWT_REFRESH_SECRET,
  //     });

  //     // 사용자 조회 및 토큰 검증
  //     const user = await this.userRepository.findById(payload.id);
  //     if (!user || user.refreshToken !== refreshToken) {
  //       throw new UnauthorizedException('유효하지 않은 refresh 토큰입니다.');
  //     }

  //     // 리프레시 토큰의 만료 시간 확인
  //     const tokenExp = new Date(payload.exp * 1000);
  //     const now = new Date();
  //     const timeUntilExp = tokenExp.getTime() - now.getTime();
  //     // 리프레시 토큰의 수명 절반을 계산
  //     // process.env.JWT_REFRESH_EXPIRES_IN 값이 있으면 그 값을 사용하고, 없으면 7일(7*24*60*60초)을 기본값으로 사용
  //     // 밀리초 단위로 변환(* 1000)한 후 2로 나누어 토큰 수명의 절반 시점을 계산
  //     const halfLife = (parseInt(process.env.JWT_REFRESH_EXPIRES_IN) || 7 * 24 * 60 * 60) * 1000 / 2;

  //     // 리프레시 토큰의 수명이 절반 이상 지났으면 새로운 리프레시 토큰 발급
  //     if (timeUntilExp < halfLife) {
  //       return this.generateTokens(user);
  //     }

  //     // 그렇지 않으면 액세스 토큰만 새로 발급
  //     const accessToken = await this.jwtService.signAsync(
  //       { id: user.id, email: user.email },
  //       { expiresIn: process.env.JWT_EXPIRES_IN }
  //     );

  //     return {
  //       accessToken,
  //       refreshToken, // 기존 리프레시 토큰 유지
  //     };
  //   } catch (error) {
      
  //     throw new UnauthorizedException('유효하지 않은 토큰입니다.');
  //   }
  // }

  async logout(userId: number) {
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
} 