import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';

import { SpeakingService } from './speaking.service.js';
import { CreateSpeakingSessionDto } from './dto/create-speaking-session.dto.js';

@Controller('speaking')
@UseGuards(JwtAuthGuard)
export class SpeakingController {
  constructor(
    @Inject(SpeakingService)
    private readonly speakingService: SpeakingService,
  ) {}

  @Post('sessions')
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateSpeakingSessionDto,
  ) {
    return this.speakingService.create(request.userId, dto);
  }

  @Get('sessions')
  findAll(@Req() request: AuthenticatedRequest) {
    return this.speakingService.findAll(request.userId);
  }
}
