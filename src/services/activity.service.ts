import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { generateConfirmationCode } from '../utils/generator';

const prisma = new PrismaClient();

export class ActivityService {
  async createActivity(
    creatorId: string,
    title: string,
    description: string,
    typeId: string,
    scheduledDate: Date,
    isPrivate: boolean = false
  ) {
    
    if (!title || !description || !typeId || !scheduledDate) {
      throw new ApiError(400, 'Campos obrigatórios faltando');
    }

    return prisma.activity.create({
      data: {
        title,
        description,
        typeId,
        confirmationCode: generateConfirmationCode(), 
        scheduledDate,
        private: isPrivate,
        creatorId,
      },
    });
  }
}