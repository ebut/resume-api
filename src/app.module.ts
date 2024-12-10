import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { ResumeModule } from './modules/resume/resume.module';
import { MinioModule } from './modules/minio/minio.module';
import { typeOrmConfig } from './config/typeorm.config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
    ResumeModule,
    MinioModule,
  ],
})
export class AppModule {}
