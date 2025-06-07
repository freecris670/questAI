import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

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
  
  // Формируем список разрешенных источников для CORS
  const allowedOrigins = [
    // Локальные URL
    'http://localhost:10000',
    'https://localhost:10000',
    'http://localhost:3000', // Для совместимости с режимом разработки
    'https://localhost:3000', // Для совместимости с режимом разработки
    
    // IP-адреса фронтенда на Render
    'http://176.64.6.69',
    'https://176.64.6.69',
    'http://172.71.192.151',
    'https://172.71.192.151',
    'http://10.201.129.68',
    'https://10.201.129.68',
    
    // Домены Render
    /^https:\/\/.*\.onrender\.com$/,
    
    // Переменная окружения для фронтенда
    process.env.FRONTEND_URL
  ];
  
  // Добавляем IP-адреса из переменной окружения, если она есть
  if (process.env.FRONTEND_IPS) {
    const frontendIps = process.env.FRONTEND_IPS.split(',').map(ip => ip.trim());
    frontendIps.forEach(ip => {
      allowedOrigins.push(`http://${ip}`);
      allowedOrigins.push(`https://${ip}`);
    });
  }
  
  // Настраиваем CORS
  app.enableCors({
    origin: allowedOrigins.filter(Boolean),
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
    log: (message: unknown) => console.log(message),
    error: (message: unknown) => console.error(message),
    warn: (message: unknown) => {
      // Отслеживаем превышение лимитов
      if (typeof message === 'string' && message.includes('ThrottlerException')) {
        console.warn(`[Rate Limit] ${message}`);
      } else {
        console.warn(message);
      }
    },
    debug: (message: unknown) => console.debug(message),
    verbose: (message: unknown) => console.log(message),
  });

  // Запускаем приложение
  // Render рекомендует использовать PORT со значением по умолчанию 10000
  // Зарезервированные порты на Render: 18012, 18013, 19099 (нельзя использовать)
  const port = process.env.PORT || 10000;
  await app.listen(port, '0.0.0.0');
  console.log(`Приложение запущено на порту: ${port}, хост: 0.0.0.0`);
  console.log(`Настроено ограничение запросов: 3 в минуту, 20 в час`);
}
bootstrap();
