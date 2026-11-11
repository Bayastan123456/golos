import {
  Body,
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { AiCoachService } from './ai-coach.service.js';
import { SpeechAnalysisService } from './speech-analysis.service.js';

import { AnalyzeSpeechDto } from './dto/analyze-speech.dto.js';

import type { SpeechAnalysisResult } from './speech-analysis.types.js';

import {
  AiRateLimitGuard,
  AiCapacityInterceptor,
} from '../../security/request-limits.js';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

@Controller('ai-coach')
@UseGuards(JwtAuthGuard, AiRateLimitGuard)
@UseInterceptors(AiCapacityInterceptor)
export class AiCoachController {
  constructor(
    @Inject(AiCoachService)
    private readonly aiCoachService: AiCoachService,

    @Inject(SpeechAnalysisService)
    private readonly analysisService: SpeechAnalysisService,
  ) {}

  // Распознаём аудио через локальный Whisper.
  @Post('transcribe')
  @UseInterceptors(
    FileInterceptor('audio', {
      limits: {
        fileSize: MAX_AUDIO_BYTES,
        files: 1,
        fields: 0,
      },
    }),
  )
  transcribe(@UploadedFile() file?: Express.Multer.File) {
    return this.aiCoachService.transcribe(file);
  }

  // Анализируем полученный текст.
  @Post('analyze')
  analyze(@Body() dto: AnalyzeSpeechDto): Promise<SpeechAnalysisResult> {
    return this.analysisService.analyze(dto);
  }
}
