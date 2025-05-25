import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Объединяет имена классов с поддержкой Tailwind CSS
 * @param inputs Классы для объединения
 * @returns Строка с объединенными классами
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
