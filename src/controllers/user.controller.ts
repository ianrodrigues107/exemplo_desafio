import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { uploadAvatar } from '../middlewares/upload';
import { s3Client } from '../config/localstack';
import { Upload } from '@aws-sdk/lib-storage';

const prisma = new PrismaClient();

export class UserController {
  async getPreferences(req: Request, res: Response) {
    const preferences = await prisma.preference.findMany({
      where: { userId: req.user.id },
      include: { activityType: true }
    });
    res.json(preferences);
  }
  async uploadAvatar(req: Request, res: Response) {
    try {
      // Verifica se o usuário está autenticado
      if (!req.user?.id) {
        throw new ApiError(401, 'Usuário não autenticado');
      }

      // Verifica se o arquivo foi enviado
      if (!req.file) {
        throw new ApiError(400, 'Nenhum arquivo de avatar enviado');
      }

      // Verifica o tipo do arquivo
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validMimeTypes.includes(req.file.mimetype)) {
        throw new ApiError(400, 'Formato inválido. Use apenas JPG ou PNG');
      }

      // Configuração do upload para o LocalStack
      const fileExtension = req.file.mimetype.split('/')[1];
      const fileName = `avatars/${req.user.id}-${Date.now()}.${fileExtension}`;

      // Upload para o LocalStack usando AWS SDK v3
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.S3_BUCKET_NAME || 'avatars',
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
          ACL: 'public-read',
        },
      });

      const result = await upload.done();

      // Atualiza o avatar no banco de dados
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatar: result.Location },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      });

      // Concede conquista por alterar avatar (opcional)
      try {
        const { AchievementService } = await import('../services/achievement.service');
        const achievementService = new AchievementService();
        await achievementService.grantAchievement(req.user.id, 'AVATAR_UPDATED');
      } catch (error) {
        console.error('Erro ao conceder conquista:', error);
      }

      return res.status(200).json({
        status: 'success',
        data: updatedUser,
      });

    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
      }

      console.error('Erro no upload de avatar:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro interno no servidor',
      });
    }
  }
}