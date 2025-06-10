'use client';

import { useEffect, useState } from 'react';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { CurrentSubscription } from '@/components/subscription/CurrentSubscription';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_period: string;
  features: string[];
  is_popular?: boolean;
}

interface Subscription {
  id: string;
  plan: Plan;
  status: 'active' | 'canceled' | 'expired';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await api.get('/payments/subscriptions/current');
        // Если response.data === null, значит подписки нет
        setSubscription(response.data);
      } catch (error: any) {
        // При любой ошибке показываем планы (подписки нет)
        setSubscription(null);
        // Показываем ошибку только если это не 404
        if (error.response?.status !== 404) {
          toast({
            title: 'Ошибка',
            description: 'Не удалось загрузить информацию о подписке',
            variant: 'destructive',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [toast]);

  const handleSubscriptionCancel = () => {
    setSubscription(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex flex-col">
        <MainHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <MainFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col">
      <MainHeader />
      <main className="container mx-auto max-w-[1200px] px-5 py-8 mt-20 flex-grow">
        <h1 className="text-3xl font-bold mb-8">Управление подпиской</h1>
        
        {subscription ? (
          <CurrentSubscription
            subscription={subscription}
            onCancel={handleSubscriptionCancel}
          />
        ) : (
          <div className="space-y-6">
            {/* Алерт для авторизованных пользователей без подписки */}
            {user && (
              <Alert className="bg-blue-50 border-blue-200">
                <InfoIcon className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  У вас нет активной подписки. Выберите подходящий план ниже, чтобы получить доступ ко всем возможностям QuestAI.
                </AlertDescription>
              </Alert>
            )}
            
            <div>
              <h2 className="text-2xl font-semibold mb-6">Выберите план подписки</h2>
              <SubscriptionPlans />
            </div>
          </div>
        )}
      </main>
      <MainFooter />
    </div>
  );
} 