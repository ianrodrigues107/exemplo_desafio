import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

class UserController {
  
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const updateData: any = { name, email };
      if (password) {
        updateData.password = await hash(password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, name: true, email: true, avatar: true },
      });

      res.status(200).json({
        status: 'success',
        data: updatedUser,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Erro interno no servidor',
      });
    }
  }

  async getUserProfile(req: Request, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new ApiError(401, 'Usuário não autenticado');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, avatar: true },
      });

      if (!user) {
        throw new ApiError(404, 'Usuário não encontrado');
      }

      res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      res.status(error instanceof ApiError ? error.statusCode : 500).json({
        status: 'error',
        message: error instanceof ApiError ? error.message : 'Erro interno no servidor',
      });
    }
  }
}

export default new UserController();