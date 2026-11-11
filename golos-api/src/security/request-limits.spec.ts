import { afterEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom, of, throwError } from 'rxjs';
import type { ExecutionContext } from '@nestjs/common';
import {
  RequestLimits,
  AiCapacityInterceptor,
  AuthRateLimitGuard,
  AiRateLimitGuard,
} from './request-limits.js';

function context(userId = 'user', handlerName = 'login', ip = '127.0.0.1') {
  const header = vi.fn();
  return {
    header,
    ctx: {
      switchToHttp: () => ({
        getRequest: () => ({ userId, ip }),
        getResponse: () => ({ setHeader: header }),
      }),
      getHandler: () => ({ name: handlerName }),
    } as unknown as ExecutionContext,
  };
}
afterEach(() => vi.useRealTimers());
describe('Request limits', () => {
  it('rejects excess attempts and allows requests after the window expires', () => {
    vi.useFakeTimers();
    const limits = new RequestLimits();
    expect(limits.consume('login:a', 1, 60_000)).toBe(0);
    expect(limits.consume('login:a', 1, 60_000)).toBe(60);
    expect(limits.consume('login:b', 1, 60_000)).toBe(0);
    vi.advanceTimersByTime(60_000);
    expect(limits.consume('login:a', 1, 60_000)).toBe(0);
  });
  it('enforces login limits by IP and sends Retry-After', () => {
    const guard = new AuthRateLimitGuard(new RequestLimits());
    const { ctx, header } = context();
    for (let i = 0; i < 5; i++) expect(guard.canActivate(ctx)).toBe(true);
    expect(() => guard.canActivate(ctx)).toThrow(
      expect.objectContaining({ status: 429 }),
    );
    expect(header).toHaveBeenCalledWith('Retry-After', expect.any(Number));
    expect(guard.canActivate(context('user', 'login', '127.0.0.2').ctx)).toBe(
      true,
    );
  });
  it('limits registration separately and meters AI by user', () => {
    const limits = new RequestLimits();
    const auth = new AuthRateLimitGuard(limits);
    const registration = context('a', 'register').ctx;
    for (let i = 0; i < 3; i++) auth.canActivate(registration);
    expect(() => auth.canActivate(registration)).toThrow(
      expect.objectContaining({ status: 429 }),
    );
    expect(auth.canActivate(context().ctx)).toBe(true);
    const ai = new AiRateLimitGuard(limits);
    for (let i = 0; i < 12; i++) ai.canActivate(context('a').ctx);
    expect(() => ai.canActivate(context('a').ctx)).toThrow(
      expect.objectContaining({ status: 429 }),
    );
    expect(ai.canActivate(context('b').ctx)).toBe(true);
  });
  it('caps concurrent users and disallows parallel work for one user', () => {
    const limits = new RequestLimits();
    const release = limits.acquire('a');
    expect(() => limits.acquire('a')).toThrow();
    limits.acquire('b');
    expect(() => limits.acquire('c')).toThrow();
    release();
    expect(() => limits.acquire('c')).not.toThrow();
  });
  it.each(['success', 'error', 'sync-error'])(
    'releases capacity after %s',
    async (mode) => {
      const limits = new RequestLimits();
      const interceptor = new AiCapacityInterceptor(limits);
      const result = interceptor.intercept(context('a').ctx, {
        handle: () => {
          if (mode === 'sync-error') throw new Error('sync');
          return mode === 'success'
            ? of('ok')
            : throwError(() => new Error('async'));
        },
      });
      await firstValueFrom(result).catch(() => undefined);
      expect(() => limits.acquire('a')).not.toThrow();
    },
  );
});
