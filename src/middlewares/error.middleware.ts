import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof Error) {
    console.error(err.stack);
    return res.status(500).json({
      status: 'error',
      message: 'Erro interno no servidor',
    });
  }

  return res.status(500).json({
    status: 'error', 
    message: 'Ocorreu um erro desconhecido'
  });
};