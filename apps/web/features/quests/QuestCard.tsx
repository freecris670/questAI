import React from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { formatDate, truncateText } from '../../lib/utils';

interface QuestCardProps {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  isPublic: boolean;
}

/**
 * Компонент карточки квеста для отображения в списке
 */
export function QuestCard({ id, title, description, createdAt, isPublic }: QuestCardProps) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        {isPublic && (
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            Публичный
          </span>
        )}
      </div>
      
      <p className="mt-2 text-muted-foreground">
        {truncateText(description, 120)}
      </p>
      
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {formatDate(createdAt)}
        </span>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/quests/${id}`}>
              Подробнее
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href={`/quests/${id}/play`}>
              Начать
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
