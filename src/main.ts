import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConfig } from './config';
import { setupCors } from './setup-cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = getConfig().port;

  setupCors(app);

  await app.listen(port);
}
bootstrap();
