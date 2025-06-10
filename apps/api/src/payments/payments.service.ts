import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CloudPaymentsService } from './cloudpayments.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly cloudPayments: CloudPaymentsService,
  ) {}

  async createSubscription(userId: string, planId: string) {
    try {
      // Получаем информацию о плане
      const { data: plan, error: planError } = await this.supabase.client
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;
      if (!plan) throw new Error('Plan not found');

      // Создаем подписку в CloudPayments
      const subscription = await this.cloudPayments.createSubscription({
        amount: plan.price,
        currency: plan.currency,
        description: `Подписка на план ${plan.name}`,
        accountId: userId,
        interval: 'Month',
        period: 1,
      });

      // Создаем запись в базе данных
      const { data: dbSubscription, error: dbError } = await this.supabase.client
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: 'pending',
          start_date: new Date(),
          end_date: this.calculateEndDate(plan.billing_period),
          cloudpayments_subscription_id: subscription.Id,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return {
        subscriptionId: dbSubscription.id,
        status: dbSubscription.status,
        paymentUrl: subscription.Model.ConfirmationUrl,
      };
    } catch (error) {
      this.logger.error('Error creating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      // Получаем информацию о подписке
      const { data: subscription, error: subError } = await this.supabase.client
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (subError) throw subError;
      if (!subscription) throw new Error('Subscription not found');

      // Отменяем подписку в CloudPayments
      await this.cloudPayments.cancelSubscription(
        subscription.cloudpayments_subscription_id
      );

      // Обновляем статус в базе данных
      const { data: updatedSubscription, error: updateError } = await this.supabase.client
        .from('subscriptions')
        .update({
          status: 'cancelled',
          auto_renew: false,
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (updateError) throw updateError;

      return updatedSubscription;
    } catch (error) {
      this.logger.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async getUserSubscriptions(userId: string) {
    try {
      const { data: subscriptions, error } = await this.supabase.client
        .from('subscriptions')
        .select(`
          *,
          plans (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return subscriptions;
    } catch (error) {
      this.logger.error('Error getting user subscriptions:', error);
      throw error;
    }
  }

  async getSubscription(subscriptionId: string) {
    try {
      const { data: subscription, error } = await this.supabase.client
        .from('subscriptions')
        .select(`
          *,
          plans (*)
        `)
        .eq('id', subscriptionId)
        .single();

      if (error) throw error;
      if (!subscription) throw new Error('Subscription not found');

      return subscription;
    } catch (error) {
      this.logger.error('Error getting subscription:', error);
      throw error;
    }
  }

  async getCurrentSubscription(userId: string) {
    try {
      const { data: subscription, error } = await this.supabase.client
        .from('subscriptions')
        .select(`
          *,
          plans (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        this.logger.error('Error getting current subscription:', error);
        throw error;
      }

      // Возвращаем subscription или null, если не найден
      return subscription;
    } catch (error) {
      this.logger.error('Error getting current subscription:', error);
      throw error;
    }
  }

  async getPlans() {
    try {
      const { data: plans, error } = await this.supabase.client
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        this.logger.error('Error getting plans:', error);
        throw error;
      }

      return plans;
    } catch (error) {
      this.logger.error('Error getting plans:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any, signature: string) {
    try {
      // Проверяем подпись
      const isValid = this.cloudPayments.validateWebhookSignature(
        payload,
        signature
      );

      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      // Обрабатываем различные типы событий
      switch (payload.event) {
        case 'payment.success':
          await this.handleSuccessfulPayment(payload.data);
          break;
        case 'payment.failed':
          await this.handleFailedPayment(payload.data);
          break;
        case 'subscription.created':
          await this.handleSubscriptionCreated(payload.data);
          break;
        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(payload.data);
          break;
        default:
          this.logger.warn('Unknown webhook event:', payload.event);
      }

      return { code: 0 };
    } catch (error) {
      this.logger.error('Error handling webhook:', error);
      throw error;
    }
  }

  private async handleSuccessfulPayment(data: any) {
    const { data: payment, error } = await this.supabase.client
      .from('payments')
      .insert({
        subscription_id: data.SubscriptionId,
        amount: data.Amount,
        currency: data.Currency,
        status: 'success',
        payment_method: data.PaymentMethod,
        cloudpayments_transaction_id: data.TransactionId,
        receipt_url: data.ReceiptUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return payment;
  }

  private async handleFailedPayment(data: any) {
    const { data: payment, error } = await this.supabase.client
      .from('payments')
      .insert({
        subscription_id: data.SubscriptionId,
        amount: data.Amount,
        currency: data.Currency,
        status: 'failed',
        payment_method: data.PaymentMethod,
        cloudpayments_transaction_id: data.TransactionId,
      })
      .select()
      .single();

    if (error) throw error;
    return payment;
  }

  private async handleSubscriptionCreated(data: any) {
    const { data: subscription, error } = await this.supabase.client
      .from('subscriptions')
      .update({
        status: 'active',
        next_billing_date: new Date(data.NextBillingDate),
      })
      .eq('cloudpayments_subscription_id', data.Id)
      .select()
      .single();

    if (error) throw error;
    return subscription;
  }

  private async handleSubscriptionCancelled(data: any) {
    const { data: subscription, error } = await this.supabase.client
      .from('subscriptions')
      .update({
        status: 'cancelled',
        auto_renew: false,
      })
      .eq('cloudpayments_subscription_id', data.Id)
      .select()
      .single();

    if (error) throw error;
    return subscription;
  }

  private calculateEndDate(billingPeriod: string): Date {
    const date = new Date();
    if (billingPeriod === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date;
  }
} 