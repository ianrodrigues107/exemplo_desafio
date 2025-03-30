import { Request, Response } from 'express';
import { ActivityService } from '../services/activity.service';

export class ActivityController {
  private activityService = new ActivityService();

  async create(req: Request, res: Response) {
    try {
      const { title, description, typeId, scheduledDate, isPrivate } = req.body;
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
    }
  }
}