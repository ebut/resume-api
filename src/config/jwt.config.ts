import { JwtModuleOptions } from '@nestjs/jwt';
import * as dotenv from 'dotenv';

dotenv.config();

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
};

export const jwtRefreshConfig: JwtModuleOptions = {
  secret: process.env.JWT_REFRESH_SECRET,
  signOptions: {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
};

export const TOKEN_CONSTANTS = {
  ACCESS_TOKEN_REFRESH_THRESHOLD: 10 * 60 * 1000, // 10분
  REFRESH_TOKEN_REFRESH_THRESHOLD: 7 * 24 * 60 * 60 * 1000 / 2, // 리프레시 토큰 수명의 절반
} as const; 