import { Injectable } from '@nestjs/common';
import { MinioService as NestMinioService } from 'nestjs-minio-client';
import * as crypto from 'crypto';

@Injectable()
export class MinioService {
  constructor(private readonly minioService: NestMinioService) {
    this.testConnection();
  }

  async uploadFile(
    filename: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    const bucket = process.env.MINIO_BUCKET;
    
    console.log('bucket', bucket);
    await this.createBucketIfNotExists(bucket);
  
    console.log('filename', filename);
    await this.minioService.client.putObject(
      bucket,
      filename,
      buffer,
      {
        'Content-Type': mimetype,
      }
    );
    // await this.minioService.client.putObject(bucket, encodedFilename, buffer, {
    //   'Content-Type': mimetype,
    //   'Content-Disposition': `inline; filename*=UTF-8''${encodedFilename}`,
    //   'x-amz-meta-originalname': filename
    // });
    
    return `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucket}/${filename}`;
  }

  private async createBucketIfNotExists(bucket: string): Promise<void> {
    const exists = await this.minioService.client.bucketExists(bucket);
    if (!exists) {
      await this.minioService.client.makeBucket(bucket);
    }
  }

  async testConnection() {
    try {
      // 버킷 리스트 조회 테스트
      const buckets = await this.minioService.client.listBuckets();
      console.log('Available buckets:', buckets);
      
      // 특정 버킷 접근 테스트
      const bucket = process.env.MINIO_BUCKET;
      const exists = await this.minioService.client.bucketExists(bucket);
      console.log(`Bucket ${bucket} exists:`, exists);
      
      return true;
    } catch (error) {
      console.error('Minio connection test failed:', error);
      throw error;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const bucket = process.env.MINIO_BUCKET;
      await this.minioService.client.removeObject(bucket, fileName);
    } catch (error) {
      console.error('Minio file deletion failed:', {
        error: error.message,
        fileName
      });
      throw error;
    }
  }

  async getFileUrl(fileName: string): Promise<string> {
    try {
      const bucket = process.env.MINIO_BUCKET;
      // presigned URL 생성 (기본 7일)
      const url = await this.minioService.client.presignedGetObject(bucket, fileName, 7 * 24 * 60 * 60);
      return url;
    } catch (error) {
      console.error('Failed to generate file URL:', {
        error: error.message,
        fileName
      });
      throw error;
    }
  }
} 