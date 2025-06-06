// server.js - Файл для запуска Next.js с настройками для Render
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Определяем режим работы приложения
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Порт по умолчанию для Render - 10000
const port = process.env.PORT || 10000;

app.prepare().then(() => {
  // Создаем HTTP-сервер
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Готово! Сервер запущен на http://0.0.0.0:${port}`);
    console.log('> Режим:', dev ? 'разработка' : 'производство');
  });
});
