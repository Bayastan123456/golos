import { Inject, Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service.js';
import { CreateSpeakingSessionDto } from './dto/create-speaking-session.dto.js';

@Injectable()
export class SpeakingService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: string, dto: CreateSpeakingSessionDto) {
    return this.prisma.speakingSession.create({
      data: {
        userId,
        topicId: dto.topicId,
        topicTitle: dto.topicTitle,
        durationSeconds: dto.durationSeconds,
        goalSeconds: dto.goalSeconds,
        rating: dto.rating,
        note: dto.note?.trim() || null,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.speakingSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 200,
    });
  }
}
