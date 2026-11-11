import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../../database/prisma.module.js';

import { ProgressController } from './progress.controller.js';
import { ProgressService } from './progress.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
