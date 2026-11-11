import { Inject, Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service.js';

export interface DailyActivity {
  date: string;
  diction: number;
  speaking: number;
  words: number;
  durationSeconds: number;
}

@Injectable()
export class ProgressService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async getSummary(userId: string) {
    // Считаем дни по UTC.
    const now = new Date();

    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    const weekStart = new Date(today);
    weekStart.setUTCDate(today.getUTCDate() - 6);

    const [
      dictionStats,
      speakingStats,
      learnedWords,
      vocabularyWords,
      dictionWeek,
      speakingWeek,
      wordsWeek,
    ] = await Promise.all([
      // Все тренировки дикции
      this.prisma.dictionSession.aggregate({
        where: { userId },
        _count: { _all: true },
        _sum: { durationSeconds: true },
      }),

      // Все выступления и средняя оценка
      this.prisma.speakingSession.aggregate({
        where: { userId },
        _count: { _all: true },
        _sum: { durationSeconds: true },
        _avg: { rating: true },
      }),

      // Изученные слова пользователя
      this.prisma.wordProgress.count({
        where: {
          userId,
          learned: true,
        },
      }),

      // Размер общего каталога слов
      this.prisma.vocabularyWord.count(),

      // Дикция за последние 7 дней
      this.prisma.dictionSession.findMany({
        where: {
          userId,
          createdAt: { gte: weekStart },
        },
        select: {
          createdAt: true,
          durationSeconds: true,
        },
      }),

      // Свободная речь за последние 7 дней
      this.prisma.speakingSession.findMany({
        where: {
          userId,
          createdAt: { gte: weekStart },
        },
        select: {
          createdAt: true,
          durationSeconds: true,
        },
      }),

      // Впервые изученные слова за 7 дней
      this.prisma.wordProgress.findMany({
        where: {
          userId,
          learned: true,
          learnedAt: { gte: weekStart },
        },
        select: {
          learnedAt: true,
        },
      }),
    ]);

    const activity: DailyActivity[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setUTCDate(weekStart.getUTCDate() + i);

      activity.push({
        date: date.toISOString().slice(0, 10),
        diction: 0,
        speaking: 0,
        words: 0,
        durationSeconds: 0,
      });
    }

    const activityMap = new Map(activity.map((day) => [day.date, day]));

    for (const session of dictionWeek) {
      const key = session.createdAt.toISOString().slice(0, 10);

      const day = activityMap.get(key);

      if (day) {
        day.diction += 1;
        day.durationSeconds += session.durationSeconds;
      }
    }

    for (const session of speakingWeek) {
      const key = session.createdAt.toISOString().slice(0, 10);

      const day = activityMap.get(key);

      if (day) {
        day.speaking += 1;
        day.durationSeconds += session.durationSeconds;
      }
    }

    for (const word of wordsWeek) {
      if (!word.learnedAt) continue;

      const key = word.learnedAt.toISOString().slice(0, 10);

      const day = activityMap.get(key);

      if (day) {
        day.words += 1;
      }
    }

    const dictionSeconds = dictionStats._sum.durationSeconds ?? 0;

    const speakingSeconds = speakingStats._sum.durationSeconds ?? 0;

    const averageRating = speakingStats._avg.rating;

    return {
      totals: {
        dictionSessions: dictionStats._count._all,
        speakingSessions: speakingStats._count._all,

        totalSessions: dictionStats._count._all + speakingStats._count._all,

        learnedWords,
        vocabularyWords,

        totalTrainingSeconds: dictionSeconds + speakingSeconds,

        averageSpeakingRating:
          averageRating === null ? null : Math.round(averageRating * 10) / 10,
      },

      activity,
    };
  }
}
