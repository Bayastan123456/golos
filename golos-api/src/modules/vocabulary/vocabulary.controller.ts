import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';

import { VocabularyService } from './vocabulary.service.js';
import { SaveWordProgressDto } from './dto/save-word-progress.dto.js';

@Controller('vocabulary')
export class VocabularyController {
  constructor(
    @Inject(VocabularyService)
    private readonly vocabularyService: VocabularyService,
  ) {}

  // Каталог доступных слов
  @Get('words')
  findAll() {
    return this.vocabularyService.findAll();
  }

  // Личный прогресс
  @Get('progress')
  @UseGuards(JwtAuthGuard)
  findMyProgress(@Req() request: AuthenticatedRequest) {
    return this.vocabularyService.findMyProgress(request.userId);
  }

  // Сохранение упражнения
  @Put('words/:wordId/progress')
  @UseGuards(JwtAuthGuard)
  saveProgress(
    @Req() request: AuthenticatedRequest,
    @Param('wordId') wordId: string,
    @Body() dto: SaveWordProgressDto,
  ) {
    return this.vocabularyService.saveProgress(request.userId, wordId, dto);
  }
}
