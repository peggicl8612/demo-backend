import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  // 開啟 CORS，Nuxt 可跨域存取 API（前端才能打得到 API）
  app.enableCors();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
