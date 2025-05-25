import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Утилита для объединения классов с поддержкой Tailwind
 * Объединяет классы с помощью clsx и оптимизирует их с помощью tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Форматирование даты в локализованную строку
 * @param date Дата для форматирования
 * @param options Опции форматирования
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ru-RU', options);
}

/**
 * Генерация уникального ID
 * @param prefix Префикс для ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Ограничение длины текста с многоточием
 * @param text Исходный текст
 * @param maxLength Максимальная длина
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Получение ключа из хранилища с поддержкой SSR
 * @param key Ключ для получения
 * @param defaultValue Значение по умолчанию
 */
export function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  const saved = localStorage.getItem(key);
  if (saved === null) {
    return defaultValue;
  }
  
  try {
    return JSON.parse(saved) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Установка значения в хранилище
 * @param key Ключ для установки
 * @param value Значение для сохранения
 */
export function setStorageValue<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.setItem(key, JSON.stringify(value));
}
