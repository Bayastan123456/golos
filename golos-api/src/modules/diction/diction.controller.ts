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

import { DictionService } from './diction.service.js';
import { CreateDictionSessionDto } from './dto/create-diction-session.dto.js';

@Controller('diction')
@UseGuards(JwtAuthGuard)
export class DictionController {
  constructor(
    @Inject(DictionService)
    private readonly dictionService: DictionService,
  ) {}

  @Post('sessions')
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateDictionSessionDto,
  ) {
    return this.dictionService.create(request.userId, dto);
  }

  @Get('sessions')
  findAll(@Req() request: AuthenticatedRequest) {
    return this.dictionService.findAll(request.userId);
  }
}
