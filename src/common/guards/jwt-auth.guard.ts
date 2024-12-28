import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../modules/user/user.service';
import { TOKEN_CONSTANTS, JWT_DEFAULTS, jwtConfig } from '../../config/jwt.config';
import { parseTimeToSeconds } from '../../common/utils/time.util';

/**
 * JWT 인증을 처리하는 가드입니다.
 * 
 * 동작 방식:
 * 1. @nestjs/passport의 AuthGuard를 상속받아 JWT 전략('jwt')을 사용합니다.
 * 
 * 2. 요청이 들어오면 Authorization 헤더의 Bearer 토큰을 검증합니다.
 * 
 * 3. handleRequest 메서드에서:
 *   - err: JWT 검증 과정에서 발생한 에러
 *   - user: JWT 페이로드에서 추출한 사용자 정보
 *   - 인증 실패시(에러 발생 또는 사용자 정보 없음) UnauthorizedException 발생
 *   - 인증 성공시 사용자 정보 반환
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // 1. Access Token 검증
      const valid = await super.canActivate(context);
      if (!valid) {
        throw new UnauthorizedException();
      }

      // 2. Request에서 사용자 정보 가져오기
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      // 3. Access Token이 만료 임박한 경우에만 갱신 시도
      const accessToken = this.extractToken(request);
      const decodedToken = this.jwtService.decode(accessToken);
      
      if (this.shouldRefreshToken(decodedToken)) {
        const refreshToken = request.cookies?.refreshToken;
        if (refreshToken) {
          const tokens = await this.userService.validateAndRefreshTokens(user.id, refreshToken);
          if (tokens) {
            const response = context.switchToHttp().getResponse();
            response.cookie('refreshToken', tokens.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: parseTimeToSeconds(
                process.env.JWT_REFRESH_EXPIRES_IN,
                JWT_DEFAULTS.REFRESH_TOKEN_EXPIRES,
              ) * 1000,
              path: '/'
            });
            response.setHeader('Authorization', `Bearer ${tokens.accessToken}`);
          }
        }
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  private shouldRefreshToken(decodedToken: any): boolean {
    if (!decodedToken || !decodedToken.exp) return false;
    
    const expirationTime = decodedToken.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    
    return timeUntilExpiry < TOKEN_CONSTANTS.ACCESS_TOKEN_REFRESH_THRESHOLD;
  }

  private extractToken(request: any): string {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;
    
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
} 