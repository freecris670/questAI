"use client";

import { cn } from '@/lib/utils';

interface AnimatedRingsProps {
  className?: string;
}

/**
 * Компонент с анимированными вращающимися кольцами в стиле MMORPG
 * Используется для экранов загрузки
 */
export function AnimatedRings({ className }: AnimatedRingsProps) {
  return (
    <div className={cn("relative w-32 h-32", className)}>
      {/* Внешнее кольцо */}
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#2553A1] animate-spin-slow" />
      
      {/* Среднее кольцо */}
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-r-[#22B07D] animate-spin-reverse" />
      
      {/* Внутреннее кольцо */}
      <div className="absolute inset-4 rounded-full border-4 border-transparent border-b-[#F59E0B] animate-spin" />
      
      {/* Центральный элемент */}
      <div className="absolute inset-6 rounded-full bg-gradient-to-br from-[#2553A1] to-[#22B07D] animate-pulse" />
      
      {/* Магические частицы */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 w-2 h-2 bg-[#22B07D] rounded-full animate-float-1" />
        <div className="absolute bottom-0 right-1/4 w-1.5 h-1.5 bg-[#F59E0B] rounded-full animate-float-2" />
        <div className="absolute left-0 top-1/3 w-1 h-1 bg-[#2553A1] rounded-full animate-float-3" />
      </div>
    </div>
  );
}
