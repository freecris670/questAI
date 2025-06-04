import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
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
    origin: [
      'http://localhost:3000',
      'https://localhost:3000',
      /^https:\/\/.*\.railway\.app$/,
      process.env.FRONTEND_URL
    ].filter(Boolean),
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
    log: (message: unknown) => logger.log(message),
    error: (message: unknown) => logger.error(message),
    warn: (message: unknown) => {
      // Отслеживаем превышение лимитов
      if (typeof message === 'string' && message.includes('ThrottlerException')) {
        logger.warn(`[Rate Limit] ${message}`);
      } else {
        logger.warn(message);
      }
    },
    debug: (message: unknown) => logger.debug(message),
    verbose: (message: unknown) => logger.verbose(message),
  });

  // Запускаем приложение
  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Приложение запущено на порту: ${port}`);
  logger.log(`Настроено ограничение запросов: 3 в минуту, 20 в час`);
}
bootstrap();
