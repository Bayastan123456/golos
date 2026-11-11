import {
  CallHandler,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Module,
  NestInterceptor,
} from '@nestjs/common';
import { defer, finalize } from 'rxjs';
import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../modules/auth/auth.types.js';

type Bucket = { count: number; expiresAt: number };

// Bounded, process-local limits. Run one API process per inference host.
@Injectable()
export class RequestLimits {
  private readonly buckets = new Map<string, Bucket>();
  private readonly activeUsers = new Set<string>();
  private readonly maxBuckets = 10_000;

  consume(key: string, limit: number, windowMs: number): number {
    const now = Date.now();
    let bucket = this.buckets.get(key);
    if (!bucket || bucket.expiresAt <= now) {
      if (this.buckets.size >= this.maxBuckets) {
        for (const [id, entry] of this.buckets) {
          if (entry.expiresAt <= now) this.buckets.delete(id);
        }
        if (this.buckets.size >= this.maxBuckets && !this.buckets.has(key)) {
          throw new HttpException(
            'Сервис занят. Попробуй позже.',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
      }
      bucket = { count: 0, expiresAt: now + windowMs };
      this.buckets.set(key, bucket);
    }
    if (bucket.count >= limit)
      return Math.max(1, Math.ceil((bucket.expiresAt - now) / 1000));
    bucket.count++;
    return 0;
  }

  acquire(userId: string): () => void {
    if (this.activeUsers.has(userId) || this.activeUsers.size >= 2) {
      throw new HttpException(
        'ИИ занят. Дождись завершения анализа и попробуй снова.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    this.activeUsers.add(userId);
    let released = false;
    return () => {
      if (!released) {
        released = true;
        this.activeUsers.delete(userId);
      }
    };
  }
}

function enforce(
  limits: RequestLimits,
  context: ExecutionContext,
  key: string,
  count: number,
  windowMs: number,
) {
  const retryAfter = limits.consume(key, count, windowMs);
  if (retryAfter) {
    context
      .switchToHttp()
      .getResponse<Response>()
      .setHeader('Retry-After', retryAfter);
    throw new HttpException(
      'Слишком много запросов. Попробуй позже.',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
  return true;
}

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  constructor(@Inject(RequestLimits) private readonly limits: RequestLimits) {}
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const registration = context.getHandler().name === 'register';
    return enforce(
      this.limits,
      context,
      `auth:${registration ? 'register' : 'login'}:${req.ip ?? req.socket.remoteAddress ?? 'unknown'}`,
      registration ? 3 : 5,
      registration ? 3_600_000 : 60_000,
    );
  }
}

@Injectable()
export class AiRateLimitGuard implements CanActivate {
  constructor(@Inject(RequestLimits) private readonly limits: RequestLimits) {}
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return enforce(this.limits, context, `ai:${req.userId}`, 12, 60_000);
  }
}

@Injectable()
export class AiCapacityInterceptor implements NestInterceptor {
  constructor(@Inject(RequestLimits) private readonly limits: RequestLimits) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const release = this.limits.acquire(req.userId);
    // Reserve before FileInterceptor allocates an audio buffer; release on every exit.
    return defer(() => next.handle()).pipe(finalize(release));
  }
}

@Module({
  providers: [
    RequestLimits,
    AuthRateLimitGuard,
    AiRateLimitGuard,
    AiCapacityInterceptor,
  ],
  exports: [
    RequestLimits,
    AuthRateLimitGuard,
    AiRateLimitGuard,
    AiCapacityInterceptor,
  ],
})
export class RequestLimitsModule {}
