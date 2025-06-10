'use client';

import { useEffect, useState } from 'react';
import { PaymentHistory } from '@/components/subscription/PaymentHistory';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  payment_method: string;
  created_at: string;
  receipt_url?: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get('/payments/history');
        setPayments(response.data);
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить историю платежей',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 space-y-8"
    >
      <h1 className="text-3xl font-bold">История платежей</h1>
      <PaymentHistory payments={payments} />
    </motion.div>
  );
} 