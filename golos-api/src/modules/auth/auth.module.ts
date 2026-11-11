import { RequestLimitsModule } from '../../security/request-limits.js';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../users/users.module.js';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Module({
  imports: [
    UsersModule,
    RequestLimitsModule,

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>('JWT_SECRET');

        if (
          config.get<string>('NODE_ENV') === 'production' &&
          /^(REPLACE_|CHANGE_)/i.test(secret)
        ) {
          throw new Error('Замените шаблон JWT_SECRET случайным секретом');
        }
        if (Buffer.byteLength(secret, 'utf8') < 32) {
          throw new Error('JWT_SECRET должен содержать минимум 32 байта');
        }

        return {
          secret,
          signOptions: {
            expiresIn: '1h',
            issuer: 'golos-api',
            audience: 'golos-web',
          },
          verifyOptions: {
            issuer: 'golos-api',
            audience: 'golos-web',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
