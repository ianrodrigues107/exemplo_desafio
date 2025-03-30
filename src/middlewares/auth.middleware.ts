import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/apiError';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
 
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new ApiError(401, 'Token não fornecido');

   
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.id,
        deletedAt: null 
      }
    });

    if (!user) throw new ApiError(401, 'Usuário não encontrado ou conta desativada');

    
    req.userId = user.id;
    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Token inválido'));
    } else {
      next(error); 
    }
  }
};