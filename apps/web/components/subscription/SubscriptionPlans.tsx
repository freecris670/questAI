"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Gift } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_period: string;
  features: any;
  is_popular?: boolean;
}

interface SubscriptionPlansProps {
  onSubscribe?: () => void;
}

export function SubscriptionPlans({ onSubscribe }: SubscriptionPlansProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/payments/plans');
        const plansData = response.data
          .filter((plan: any) => plan.is_active) // Фильтруем только активные планы (исключаем Базовый)
          .map((plan: any) => ({
            ...plan,
            is_popular: plan.name === 'Премиум', // Помечаем Премиум как популярный
            features: plan.features?.descriptions || []
          }));
        setPlans(plansData);
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить планы подписки',
          variant: 'destructive',
        });
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, [toast]);

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(planId);
      const response = await api.post('/payments/subscriptions', { planId });
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось оформить подписку',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {plans.map((plan: Plan) => (
          <motion.div key={plan.id} variants={itemVariants}>
            <Card className={`relative ${plan.is_popular ? 'border-primary' : ''}`}>
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                    Популярный
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">
                  {plan.price} {plan.currency === 'RUB' ? '₽' : plan.currency}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{plan.billing_period === 'monthly' ? 'месяц' : plan.billing_period}
                  </span>
                </div>
                <ul className="space-y-2">
                  {plan.features && Array.isArray(plan.features) && plan.features.map((feature: string, index: number) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id ? 'Оформление...' : 'Подписаться'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Информация о бесплатном режиме */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6"
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Бесплатный режим
            </h3>
            <p className="text-gray-600 mb-3">
              Попробуйте QuestAI абсолютно бесплатно! Каждый месяц вы получаете 5 бесплатных квестов для знакомства с платформой.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                5 квестов в месяц
              </span>
              <span className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                Базовая поддержка
              </span>
              <span className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                Без регистрации
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 