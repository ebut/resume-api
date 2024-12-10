import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mssql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: false, //process.env.NODE_ENV === 'development',
  logging: true, // 쿼리 로그를 콘솔에 출력합니다
  logger: 'file', // 'advanced-console' | 'simple-console' | 'file' | 'debug', // 로거 옵션: advanced-console(자세한 로그), simple-console(간단한 로그), file(파일로 저장), debug(디버그용)
  
  options: {
    encrypt: false,
  },
}; 