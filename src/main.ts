import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './common/filters/all-exception.filter';

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
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  // 註冊全域錯誤過濾器
  app.useGlobalFilters(new AllExceptionFilter());
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`後端伺服器已啟動，ports: ${port}`);
}
bootstrap();
