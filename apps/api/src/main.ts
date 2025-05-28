import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ThrottlerModule } from '@nestjs/throttler';

async function bootstrap() {
  // Используем явное приведение типа для Express
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Настройка доверия к прокси для корректного определения IP для rate limiting
  app.set('trust proxy', true);
  
  // Устанавливаем глобальный префикс для всех роутов
  app.setGlobalPrefix('api');
  
  // Включаем валидацию на уровне приложения
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет свойства, которые не имеют декораторов
      forbidNonWhitelisted: true, // Выбрасывает ошибку, если есть лишние свойства
      transform: true, // Автоматически преобразует типы
    }),
  );
  
  // Настраиваем CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  // Настраиваем Swagger
  const config = new DocumentBuilder()
    .setTitle('QuestAI API')
    .setDescription('API для сервиса генерации и прохождения квестов QuestAI')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Настройка информационного логирования о превышении лимитов запросов
  app.useLogger({
    log: (message: any) => console.log(message),
    error: (message: any) => console.error(message),
    warn: (message: any) => {
      // Отслеживаем превышение лимитов
      if (typeof message === 'string' && message.includes('ThrottlerException')) {
        console.warn(`[Rate Limit] ${message}`);
      } else {
        console.warn(message);
      }
    },
    debug: (message: any) => console.debug(message),
    verbose: (message: any) => console.log(message),
  });

  // Запускаем приложение
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Приложение запущено на порту: ${port}`);
  console.log(`Настроено ограничение запросов: 3 в минуту, 20 в час`);
}
bootstrap();
