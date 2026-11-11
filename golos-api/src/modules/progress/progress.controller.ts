import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import type { AuthenticatedRequest } from '../auth/auth.types.js';

import { ProgressService } from './progress.service.js';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(
    @Inject(ProgressService)
    private readonly progressService: ProgressService,
  ) {}

  @Get('summary')
  getSummary(@Req() request: AuthenticatedRequest) {
    return this.progressService.getSummary(request.userId);
  }
}
