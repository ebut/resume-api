import { Module } from '@nestjs/common';
import { MinioModule as NestMinioModule } from 'nestjs-minio-client';
import { MinioService } from './minio.service';
import { minioConfig } from '../../config/minio.config';

@Module({
  imports: [
    NestMinioModule.register(minioConfig),
    // NestMinioModule.register({
    //   endPoint: 'minio-dev.jinhaksa.com',
    //   port: 9100,
    //   useSSL: true,
    //   accessKey: 'M7neFgWEQ6Ek1wZCv2r0',
    //   secretKey: 'I3m1gKIPm6Z8oLLdThpbGdjCcpQ78pcA6ZDvRQw9',
    // }),
  ],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {} 