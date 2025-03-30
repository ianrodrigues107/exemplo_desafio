import multer from 'multer';
import { Upload } from '@aws-sdk/lib-storage';
import { s3Client } from '../config/localstack';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadAvatar = upload.single('avatar');