import { ClientOptions } from 'minio';
import * as dotenv from 'dotenv';

dotenv.config();

export const minioConfig: ClientOptions = {
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT, 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
}; 