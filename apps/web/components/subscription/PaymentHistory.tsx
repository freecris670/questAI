import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  payment_method: string;
  created_at: string;
  receipt_url?: string;
}

interface PaymentHistoryProps {
  payments: Payment[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  const { toast } = useToast();

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Payment['status']) => {
    switch (status) {
      case 'success':
        return 'Успешно';
      case 'failed':
        return 'Ошибка';
      case 'pending':
        return 'В обработке';
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
          <CardTitle>История платежей</CardTitle>
          <CardDescription>Просмотр всех ваших платежей</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Способ оплаты</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {format(new Date(payment.created_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                  </TableCell>
                  <TableCell>
                    {payment.amount} {payment.currency}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(payment.status)}>
                      {getStatusText(payment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.payment_method}</TableCell>
                  <TableCell>
                    {payment.receipt_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(payment.receipt_url, '_blank')}
                      >
                        Чек
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
} 