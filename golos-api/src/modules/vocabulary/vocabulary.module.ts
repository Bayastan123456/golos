import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../../database/prisma.module.js';

import { VocabularyController } from './vocabulary.controller.js';
import { VocabularyService } from './vocabulary.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [VocabularyController],
  providers: [VocabularyService],
  exports: [VocabularyService],
})
export class VocabularyModule {}
