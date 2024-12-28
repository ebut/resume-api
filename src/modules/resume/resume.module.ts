import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { ResumeRepository } from './resume.repository';
import { Resume } from './entities/resume.entity';
import { Education } from './entities/education.entity';
import { Experience } from './entities/experience.entity';
import { Skill } from './entities/skill.entity';
import { Portfolio } from './entities/portfolio.entity';
import { MinioModule } from '../minio/minio.module';
import { UserModule } from '../user/user.module';
import { jwtConfig } from '../../config/jwt.config';
@Module({
  imports: [
    TypeOrmModule.forFeature([Resume, Education, Experience, Skill, Portfolio]),
    ConfigModule,
    JwtModule.registerAsync(jwtConfig),
    MinioModule,
    forwardRef(() => UserModule),
  ],
  controllers: [ResumeController],
  providers: [ResumeService, ResumeRepository],
  exports: [ResumeService],
})
export class ResumeModule {} 