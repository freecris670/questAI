import { Request } from 'express';

/**
 * Извлекает IP-адрес из объекта запроса Express.
 * Приоритет отдается заголовку 'x-forwarded-for', который используется прокси-серверами.
 * @param request Объект запроса Express.
 * @returns Строка с IP-адресом пользователя или '0.0.0.0', если определить не удалось.
 */
export function getIpFromRequest(request: Request): string {
  let ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
  if (Array.isArray(ip)) {
    ip = ip[0];
  }
  return (ip as string) || '0.0.0.0';
} 