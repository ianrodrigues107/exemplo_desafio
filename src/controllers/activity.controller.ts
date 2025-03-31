import { Request, Response } from 'express';
import { ActivityService } from '../services/activity.service';
import { ApiError } from '../utils/apiError';

declare global {
  namespace Express {
    interface Request {
      userId?: string; 
    }
  }
}

export class ActivityController {
  private activityService = new ActivityService();

  async create(req: Request, res: Response) {
    try {
      const { title, description, typeId, scheduledDate, isPrivate } = req.body;
      
    
      if (!req.userId) {
        throw new ApiError(401, 'Usuário não autenticado');
      }

      const activity = await this.activityService.createActivity(
        req.userId, 
        title,
        description,
        typeId,
        new Date(scheduledDate),
        isPrivate
      );

      res.status(201).json({
        status: 'success',
        data: activity,
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

  async approveParticipant(req: Request, res: Response) {
    try {
      const { id: activityId } = req.params;
      const { userId, approve } = req.body;

      if (!userId || typeof approve !== 'boolean') {
        throw new ApiError(400, 'Parâmetros inválidos');
      }

      const result = await this.activityService.approveParticipant(
        activityId,
        userId,
        approve
      );

      if (approve) {
        try {
          await this.activityService.confirmCheckIn(activityId, userId, 'SYSTEM_APPROVAL');
        } catch (xpError) {
          console.error('Erro ao conceder XP/conquistas:', xpError);
        }
      }

      res.status(200).json({
        status: 'success',
        data: result,
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
}