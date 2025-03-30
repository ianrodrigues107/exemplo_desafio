import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { generateConfirmationCode } from '../utils/generator';
import { AchievementService } from './achievement.service';

const prisma = new PrismaClient();
const achievementService = new AchievementService();

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
      throw new ApiError(400, 'E1: Campos obrigatórios faltando');
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

  async confirmCheckIn(activityId: string, userId: string, confirmationCode: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { participants: true }
    });

    if (!activity) {
      throw new ApiError(404, 'Atividade não encontrada');
    }

    // Validações (E10, E11, E12, E13)
    if (activity.confirmationCode !== confirmationCode) {
      throw new ApiError(400, 'E10: Código de confirmação incorreto');
    }

    if (activity.completedAt) {
      throw new ApiError(400, 'E13: Atividade já concluída');
    }

    const existingCheckIn = activity.participants.find(
      p => p.userId === userId && p.confirmedAt
    );
    if (existingCheckIn) {
      throw new ApiError(400, 'E11: Check-in já realizado');
    }

    // Atualiza check-in
    const updatedParticipant = await prisma.activityParticipant.update({
      where: {
        activityId_userId: { activityId, userId }
      },
      data: { confirmedAt: new Date() },
      include: { activity: { select: { creatorId: true } }
    });

    // Sistema de XP (participante + criador)
    try {
      await achievementService.addXp(userId, 50);
      await achievementService.addXp(activity.creatorId, 20);
      
      await achievementService.grantAchievement(userId, 'FIRST_CHECKIN');
      await achievementService.grantAchievement(activity.creatorId, 'HOST_FIRST_CHECKIN');
    } catch (error) {
      console.error('Erro no sistema de XP:', error);
    }

    return updatedParticipant;
  }

  async concludeActivity(activityId: string, creatorId: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId }
    });

    if (!activity) {
      throw new ApiError(404, 'Atividade não encontrada');
    }

    // Validação E17
    if (activity.creatorId !== creatorId) {
      throw new ApiError(403, 'E17: Apenas o criador pode concluir a atividade');
    }

    return prisma.activity.update({
      where: { id: activityId },
      data: { completedAt: new Date() }
    });
  }

  async approveParticipant(activityId: string, userId: string, approve: boolean) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId }
    });

    if (!activity) {
      throw new ApiError(404, 'Atividade não encontrada');
    }

    if (!activity.private) {
      throw new ApiError(400, 'E16: Apenas atividades privadas requerem aprovação');
    }

    const participant = await prisma.activityParticipant.update({
      where: { activityId_userId: { activityId, userId } },
      data: { approved: approve },
      include: { activity: { select: { creatorId: true } }
    });

    if (approve) {
      try {
        await achievementService.addXp(userId, 50);
        await achievementService.addXp(activity.creatorId, 20);
        await achievementService.grantAchievement(userId, 'FIRST_APPROVAL');
      } catch (error) {
        console.error('Erro ao conceder XP:', error);
      }
    }

    return participant;
  }

  async getActivityParticipants(activityId: string, userId: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { creatorId: true, private: true }
    });

    if (!activity) {
      throw new ApiError(404, 'Atividade não encontrada');
    }

    // Validação E19 (apenas criador ou participantes)
    if (activity.creatorId !== userId) {
      const isParticipant = await prisma.activityParticipant.findFirst({
        where: { activityId, userId, approved: true }
      });
      if (!isParticipant) {
        throw new ApiError(403, 'E19: Acesso não autorizado');
      }
    }

    return prisma.activityParticipant.findMany({
      where: { activityId },
      include: { user: { select: { id: true, name: true, avatar: true } } }
    });
  }
}