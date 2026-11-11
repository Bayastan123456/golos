import { Test } from '@nestjs/testing';
import { afterEach, expect, it, vi } from 'vitest';
import { AppModule } from './app.module.js';
import { configureHttp } from './configure-http.js';
import { PrismaService } from './database/prisma.service.js';
import {
  RequestLimits,
  AuthRateLimitGuard,
  AiRateLimitGuard,
  AiCapacityInterceptor,
} from './security/request-limits.js';

afterEach(() => vi.unstubAllEnvs());

it('initializes HTTP routes and shares rate limits without connecting to real services', async () => {
  vi.stubEnv('NODE_ENV', 'test');
  vi.stubEnv('JWT_SECRET', 'test-only-secret-01234567890123456789');
  vi.stubEnv('FRONTEND_URL', 'http://localhost:5173');
  const fixture = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue({})
    .compile();
  const app = fixture.createNestApplication();
  try {
    configureHttp(app);
    await app.init();
    expect(app.get(RequestLimits)).toBeInstanceOf(RequestLimits);
    expect(app.get(AuthRateLimitGuard)).toBeInstanceOf(AuthRateLimitGuard);
    expect(app.get(AiRateLimitGuard)).toBeInstanceOf(AiRateLimitGuard);
    expect(app.get(AiCapacityInterceptor)).toBeInstanceOf(
      AiCapacityInterceptor,
    );
    expect(app.getHttpServer().listening).toBe(false);
  } finally {
    await app.close();
  }
});
