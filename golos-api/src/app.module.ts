import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module.js';
import { DictionModule } from './modules/diction/diction.module.js';
import { SpeakingModule } from './modules/speaking/speaking.module.js';
import { ProgressModule } from './modules/progress/progress.module.js';
import { AiCoachModule } from './modules/ai-coach/ai-coach.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    HealthModule,
    AuthModule,
    VocabularyModule,
    DictionModule,
    SpeakingModule,
    ProgressModule,
    AiCoachModule,
  ],
})
export class AppModule {}
