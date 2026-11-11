import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import type { AuthenticatedRequest, JwtPayload } from '../auth.types.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token: unknown = request.cookies?.golos_access;

    if (typeof token !== 'string' || !token) {
      throw new UnauthorizedException('Необходима авторизация');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      if (!payload || typeof payload.sub !== 'string' || !payload.sub) {
        throw new Error('Invalid token payload');
      }

      request.userId = payload.sub;

      return true;
    } catch {
      throw new UnauthorizedException('Сессия истекла или недействительна');
    }
  }
}
