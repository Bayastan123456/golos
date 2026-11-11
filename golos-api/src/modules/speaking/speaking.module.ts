import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

import { SpeakingController } from './speaking.controller.js';
import { SpeakingService } from './speaking.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SpeakingController],
  providers: [SpeakingService],
})
export class SpeakingModule {}
