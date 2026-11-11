import { describe, expect, it, vi } from 'vitest';
import { HealthController } from './health.controller.js';
import type { PrismaService } from '../../database/prisma.service.js';

describe('HealthController readiness', () => {
  it('checks the database before reporting readiness', async () => {
    const query = vi.fn().mockResolvedValue([{ value: 1 }]);
    const controller = new HealthController({
      $queryRaw: query,
    } as unknown as PrismaService);
    await expect(controller.ready()).resolves.toEqual({
      status: 'ok',
      database: 'ok',
    });
    expect(query).toHaveBeenCalledOnce();
  });
  it('reports 503 without exposing database errors', async () => {
    const controller = new HealthController({
      $queryRaw: vi
        .fn()
        .mockRejectedValue(new Error('private database details')),
    } as unknown as PrismaService);
    await expect(controller.ready()).rejects.toMatchObject({
      status: 503,
      message: 'База данных недоступна',
    });
  });
});
