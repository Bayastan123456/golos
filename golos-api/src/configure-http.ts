import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';

export function configureHttp(app: INestApplication) {
  const config = app.get(ConfigService);
  const production = config.get<string>('NODE_ENV') === 'production';
  const configuredOrigin = config.get<string>('FRONTEND_URL');
  if (
    production &&
    (!configuredOrigin || new URL(configuredOrigin).protocol !== 'https:')
  ) {
    throw new Error(
      'В production FRONTEND_URL должен содержать HTTPS origin сайта',
    );
  }
  const frontendUrl = new URL(configuredOrigin ?? 'http://localhost:5173')
    .origin;
  const trustedProxy = config.get<string>('TRUST_PROXY');
  if (trustedProxy)
    app.getHttpAdapter().getInstance().set('trust proxy', trustedProxy);
  app.enableShutdownHooks();

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Защита от запросов изменения данных
  // с посторонних браузерных сайтов.
  app.use((req: Request, res: Response, next: NextFunction) => {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

    if (!safeMethods.includes(req.method)) {
      const origin = req.headers.origin;
      const fetchSite = req.headers['sec-fetch-site'];

      if (
        (origin && origin !== frontendUrl) ||
        (!origin && fetchSite === 'cross-site')
      ) {
        res.status(403).json({
          message: 'Недоверенный источник запроса',
        });
        return;
      }
    }

    next();
  });

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });
}
