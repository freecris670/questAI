"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface Subscription {
  id: string;
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    billing_period: string;
  };
  status: 'active' | 'canceled' | 'expired';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}

interface CurrentSubscriptionProps {
  subscription: Subscription;
  onCancel?: () => void;
}

export function CurrentSubscription({ subscription, onCancel }: CurrentSubscriptionProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCancel = async () => {
    try {
      setLoading(true);
      await api.post(`/payments/subscriptions/${subscription.id}/cancel`);
      toast({
        title: 'Успешно',
        description: 'Подписка отменена',
      });
      onCancel?.();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отменить подписку',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'canceled':
        return 'bg-yellow-500';
      case 'expired':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'canceled':
        return 'Отменена';
      case 'expired':
        return 'Истекла';
      default:
        return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{subscription.plan.name}</CardTitle>
              <CardDescription>{subscription.plan.description}</CardDescription>
            </div>
            <Badge className={getStatusColor(subscription.status)}>
              {getStatusText(subscription.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-sm font-medium text-muted-foreground">Дата начала</div>
              <div>{format(new Date(subscription.start_date), 'd MMMM yyyy', { locale: ru })}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-sm font-medium text-muted-foreground">Дата окончания</div>
              <div>{format(new Date(subscription.end_date), 'd MMMM yyyy', { locale: ru })}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-sm font-medium text-muted-foreground">Автопродление</div>
              <div>{subscription.auto_renew ? 'Включено' : 'Отключено'}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-sm font-medium text-muted-foreground">Стоимость</div>
              <div>
                {subscription.plan.price} {subscription.plan.currency} / {subscription.plan.billing_period}
              </div>
            </motion.div>
          </div>
        </CardContent>
        {subscription.status === 'active' && (
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={loading}>
                  {loading ? 'Отмена...' : 'Отменить подписку'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Отменить подписку?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Вы уверены, что хотите отменить подписку? После отмены вы сохраните доступ до конца оплаченного периода.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Нет</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>Да, отменить</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
} 