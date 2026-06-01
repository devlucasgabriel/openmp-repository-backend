import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HTTP_PORT, NODE_ENV } from './shared/common/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(HTTP_PORT)


  console.log('-------------------------------------------------------------')
  console.log(`🚀 App starting in ${NODE_ENV} mode on port ${HTTP_PORT}!! 🚀`)
  console.log('-------------------------------------------------------------')
}
bootstrap();
