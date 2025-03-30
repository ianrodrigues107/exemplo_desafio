import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AchievementService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async addXp(userId: string, xp: number) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: xp } },
    });

    // Verifica se subiu de nível (ex: 100 XP = nível 1)
    const newLevel = Math.floor(user.xp / 100);
    if (newLevel > user.level) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });
      await this.grantAchievement(userId, `LEVEL_${newLevel}`);
    }
  }

  async grantAchievement(userId: string, criterion: string) {
    const achievement = await this.prisma.achievement.findFirst({
      where: { criterion },
    });

    if (!achievement) return;

    // Verifica se o usuário já tem a conquista
    const hasAchievement = await this.prisma.userAchievement.findFirst({
      where: { 
        userId,
        achievementId: achievement.id,
      },
    });

    if (!hasAchievement) {
      await this.prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });
    }
  }
}