import { Inject, Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service.js';
import { CreateDictionSessionDto } from './dto/create-diction-session.dto.js';

@Injectable()
export class DictionService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: string, dto: CreateDictionSessionDto) {
    return this.prisma.dictionSession.create({
      data: {
        userId,
        exerciseId: dto.exerciseId,
        exerciseTitle: dto.exerciseTitle,
        durationSeconds: dto.durationSeconds,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.dictionSession.findMany({
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
