import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
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
  
  // Запускаем приложение
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Приложение запущено на порту: ${port}`);
}
bootstrap();
