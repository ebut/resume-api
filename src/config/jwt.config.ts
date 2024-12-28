import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { parseTimeToSeconds } from '../common/utils/time.util';
import * as dotenv from 'dotenv';

dotenv.config();

// JWT 관련 기본값 정의
export const JWT_DEFAULTS = {
  ACCESS_TOKEN_EXPIRES: 60 * 60,        // 1시간
  REFRESH_TOKEN_EXPIRES: 7 * 24 * 60 * 60,  // 7일
  ACCESS_TOKEN_REFRESH_RATIO: 3,        // 만료 시간의 1/3 시점에 갱신
  REFRESH_TOKEN_REFRESH_RATIO: 2,       // 만료 시간의 1/2 시점에 갱신
} as const;

export const jwtConfig: JwtModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
    },
  }),
  inject: [ConfigService],
};

export const jwtRefreshConfig: JwtModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_REFRESH_SECRET'),
    signOptions: {
      expiresIn: configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    },
  }),
  inject: [ConfigService],
};

export const TOKEN_CONSTANTS = {
  ACCESS_TOKEN_REFRESH_THRESHOLD: 
    (parseTimeToSeconds(process.env.JWT_EXPIRES_IN, JWT_DEFAULTS.ACCESS_TOKEN_EXPIRES) * 1000) 
    / JWT_DEFAULTS.ACCESS_TOKEN_REFRESH_RATIO,
  REFRESH_TOKEN_REFRESH_THRESHOLD: 
    (parseTimeToSeconds(process.env.JWT_REFRESH_EXPIRES_IN, JWT_DEFAULTS.REFRESH_TOKEN_EXPIRES) * 1000) 
    / JWT_DEFAULTS.REFRESH_TOKEN_REFRESH_RATIO,
} as const;