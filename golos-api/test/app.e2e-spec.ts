import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'node:http';
import { vi } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { configureHttp } from '../src/configure-http.js';

// Use a dedicated migrated test database; never silently reuse the developer database.
describe('Golos API integration', () => {
  let app: INestApplication<Server> | undefined;
  let prisma: PrismaService;
  const createdUsers: string[] = [];
  let wordId: string | undefined;
  let cookieA: string;
  let cookieB: string;
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const emailA = `test-a-${suffix}@example.com`;
  const emailB = `test-b-${suffix}@example.com`;
  const password = 'Integration-test-password-42';

  beforeAll(async () => {
    if (!process.env.TEST_DATABASE_URL) {
      throw new Error(
        'Set TEST_DATABASE_URL to a dedicated PostgreSQL database and apply migrations before running integration tests.',
      );
    }
    vi.stubEnv('DATABASE_URL', process.env.TEST_DATABASE_URL);
    vi.stubEnv('JWT_SECRET', 'test-only-secret-01234567890123456789');
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('FRONTEND_URL', 'http://localhost:5173');
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    configureHttp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    try {
      if (prisma) {
        if (createdUsers.length)
          await prisma.user.deleteMany({ where: { id: { in: createdUsers } } });
        if (wordId)
          await prisma.vocabularyWord.delete({ where: { id: wordId } });
      }
    } finally {
      await app?.close();
      vi.unstubAllEnvs();
    }
  });

  it('reports readiness and rejects unauthenticated private requests', async () => {
    await request(app!.getHttpServer()).get('/api/health/ready').expect(200);
    for (const path of [
      '/auth/me',
      '/progress/summary',
      '/diction/sessions',
      '/speaking/sessions',
      '/vocabulary/progress',
    ]) {
      await request(app!.getHttpServer()).get(`/api${path}`).expect(401);
    }
  });

  it('registers two users with safe cookies and no password hash in responses', async () => {
    for (const email of [emailA, emailB]) {
      const response = await request(app!.getHttpServer())
        .post('/api/auth/register')
        .send({ email, password })
        .expect(201);
      createdUsers.push(response.body.user.id);
      expect(response.body.user.passwordHash).toBeUndefined();
      const cookies = response.headers['set-cookie'] as unknown as string[];
      expect(cookies[0]).toContain('HttpOnly');
      expect(cookies[0]).toContain('SameSite=Strict');
      if (email === emailA) cookieA = cookies[0].split(';')[0];
      else cookieB = cookies[0].split(';')[0];
    }
  });

  it('validates requests and blocks untrusted browser origins', async () => {
    await request(app!.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'invalid', password })
      .expect(400);
    await request(app!.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', 'https://untrusted.example')
      .send({ email: emailA, password })
      .expect(403);
    await request(app!.getHttpServer())
      .post('/api/ai-coach/analyze')
      .set('Cookie', cookieA)
      .send({ text: 'Привет', durationSeconds: 601 })
      .expect(400);
    await request(app!.getHttpServer())
      .post('/api/ai-coach/transcribe')
      .set('Cookie', cookieA)
      .attach('audio', Buffer.alloc(2048), {
        filename: 'fake.webm',
        contentType: 'audio/webm',
      })
      .expect(400);
  });

  it('saves sessions and isolates progress between accounts', async () => {
    await request(app!.getHttpServer())
      .post('/api/diction/sessions')
      .set('Cookie', cookieA)
      .send({ exerciseId: 'test', exerciseTitle: 'Тест', durationSeconds: 30 })
      .expect(201);
    await request(app!.getHttpServer())
      .post('/api/speaking/sessions')
      .set('Cookie', cookieA)
      .send({
        topicId: 'test',
        topicTitle: 'Тест',
        durationSeconds: 60,
        goalSeconds: 120,
        rating: 4,
      })
      .expect(201);
    const word = await prisma.vocabularyWord.create({
      data: { word: `test-${suffix}`, meaning: 'тест', example: 'тест' },
    });
    wordId = word.id;
    await request(app!.getHttpServer())
      .put(`/api/vocabulary/words/${wordId}/progress`)
      .set('Cookie', cookieA)
      .send({
        sentence: 'Это достаточно длинное тестовое предложение.',
        learned: true,
      })
      .expect(200);
    const own = await request(app!.getHttpServer())
      .get('/api/progress/summary')
      .set('Cookie', cookieA)
      .expect(200);
    expect(own.body.totals.totalSessions).toBe(2);
    expect(own.body.totals.learnedWords).toBe(1);
    const other = await request(app!.getHttpServer())
      .get('/api/progress/summary')
      .set('Cookie', cookieB)
      .expect(200);
    expect(other.body.totals.totalSessions).toBe(0);
    expect(other.body.totals.learnedWords).toBe(0);
    const progress = await request(app!.getHttpServer())
      .get('/api/vocabulary/progress')
      .set('Cookie', cookieB)
      .expect(200);
    expect(progress.body).toEqual([]);
  });

  it('rejects wrong passwords, logs in, and clears the session cookie on logout', async () => {
    await request(app!.getHttpServer())
      .post('/api/auth/login')
      .send({ email: emailA, password: 'wrong' })
      .expect(401);
    const login = await request(app!.getHttpServer())
      .post('/api/auth/login')
      .send({ email: emailA, password })
      .expect(200);
    const cookie = (
      login.headers['set-cookie'] as unknown as string[]
    )[0].split(';')[0];
    await request(app!.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', cookie)
      .expect(200);
    const logout = await request(app!.getHttpServer())
      .post('/api/auth/logout')
      .set('Cookie', cookie)
      .expect(204);
    expect(logout.headers['set-cookie'][0]).toContain('golos_access=;');
    await request(app!.getHttpServer()).get('/api/auth/me').expect(401);
  });
});
