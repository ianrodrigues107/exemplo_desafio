import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { generateConfirmationCode } from '../utils/generator';
import { AchievementService } from './achievement.service'; // Importe o serviço

const prisma = new PrismaClient();
const achievementService = new AchievementService(); // Instancie o serviço

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

  async approveParticipant(activityId: string, userId: string, approve: boolean) {
    // 1. Verifica se a atividade existe e é privada
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new ApiError(404, 'Atividade não encontrada');
    }

    if (!activity.private) {
      throw new ApiError(400, 'Apenas atividades privadas requerem aprovação');
    }

    // 2. Atualiza o status de aprovação do participante
    const updatedParticipant = await prisma.activityParticipant.update({
      where: { 
        activityId_userId: { 
          activityId, 
          userId 
        } 
      },
      data: { 
        approved: approve,
        // Se estiver aprovando, marca como confirmado também
        ...(approve && { confirmedAt: new Date() })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        },
        activity: {
          select: {
            creatorId: true
          }
        }
      }
    });

    // 3. Se for uma aprovação, concede XP e conquistas
    if (approve) {
      try {
        // Participante ganha XP (50) e conquista
        await achievementService.addXp(userId, 50);
        await achievementService.grantAchievement(userId, 'FIRST_CHECKIN');
        
        // Criador ganha XP (20) e conquista
        await achievementService.addXp(activity.creatorId, 20);
        await achievementService.grantAchievement(activity.creatorId, 'HOST_FIRST_APPROVAL');
        
      } catch (error) {
        console.error('Erro ao conceder XP/conquistas:', error);
        // Não interrompe o fluxo principal
      }
    }

    return updatedParticipant;
  }
}