import { RequestLimitsModule } from '../../security/request-limits.js';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';

import { AiCoachController } from './ai-coach.controller.js';
import { AiCoachService } from './ai-coach.service.js';
import { SpeechAnalysisService } from './speech-analysis.service.js';

@Module({
  imports: [AuthModule, RequestLimitsModule],

  controllers: [AiCoachController],

  providers: [AiCoachService, SpeechAnalysisService],
})
export class AiCoachModule {}
