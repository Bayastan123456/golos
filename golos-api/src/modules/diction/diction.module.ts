import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../../database/prisma.module.js';

import { DictionController } from './diction.controller.js';
import { DictionService } from './diction.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DictionController],
  providers: [DictionService],
})
export class DictionModule {}
