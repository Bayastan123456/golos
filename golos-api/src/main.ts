import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { configureHttp } from './configure-http.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureHttp(app);
  const config = app.get(ConfigService);
  const port = Number(config.get('PORT') ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Invalid PORT');
  await app.listen(port, config.get<string>('HOST') ?? '127.0.0.1');
  console.log(`Golos API: http://localhost:${port}/api`);
}

void bootstrap();
