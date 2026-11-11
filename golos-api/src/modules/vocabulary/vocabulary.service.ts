import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service.js';
import { SaveWordProgressDto } from './dto/save-word-progress.dto.js';

@Injectable()
export class VocabularyService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  // Общий каталог слов
  findAll() {
    return this.prisma.vocabularyWord.findMany({
      select: {
        id: true,
        word: true,
        meaning: true,
        example: true,
        level: true,
      },
      orderBy: {
        word: 'asc',
      },
    });
  }

  // Прогресс текущего пользователя
  findMyProgress(userId: string) {
    return this.prisma.wordProgress.findMany({
      where: {
        userId,
      },
      select: {
        wordId: true,
        sentence: true,
        learned: true,
        learnedAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  // Сохранить или обновить слово
  async saveProgress(userId: string, wordId: string, dto: SaveWordProgressDto) {
    const sentence = dto.sentence.trim();

    if (dto.learned && sentence.length < 12) {
      throw new BadRequestException(
        'Для изученного слова нужно предложение минимум из 12 символов',
      );
    }

    const word = await this.prisma.vocabularyWord.findUnique({
      where: { id: wordId },
      select: { id: true },
    });

    if (!word) {
      throw new NotFoundException('Слово не найдено');
    }

    const where = {
      userId_wordId: {
        userId,
        wordId,
      },
    };

    const previous = await this.prisma.wordProgress.findUnique({
      where,
    });

    const learnedAt = dto.learned
      ? previous?.learned && previous.learnedAt
        ? previous.learnedAt
        : new Date()
      : null;

    return this.prisma.wordProgress.upsert({
      where,
      update: {
        sentence,
        learned: dto.learned,
        learnedAt,
      },
      create: {
        userId,
        wordId,
        sentence,
        learned: dto.learned,
        learnedAt,
      },
      select: {
        wordId: true,
        sentence: true,
        learned: true,
        learnedAt: true,
        updatedAt: true,
      },
    });
  }
}
