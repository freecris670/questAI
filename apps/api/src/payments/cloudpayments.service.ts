import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class CloudPaymentsService {
  private readonly logger = new Logger(CloudPaymentsService.name);
  private readonly apiUrl: string;
  private readonly publicId: string;
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('CLOUDPAYMENTS_API_URL');
    this.publicId = this.configService.get<string>('CLOUDPAYMENTS_PUBLIC_ID');
    this.secretKey = this.configService.get<string>('CLOUDPAYMENTS_SECRET_KEY');
  }

  private generateSignature(data: any): string {
    const sortedData = Object.keys(data)
      .sort()
      .reduce((acc, key) => {
        acc[key] = data[key];
        return acc;
      }, {});

    const signatureString = Object.entries(sortedData)
      .map(([key, value]) => `${key}=${value}`)
      .join(';');

    return crypto
      .createHmac('sha256', this.secretKey)
      .update(signatureString)
      .digest('base64');
  }

  async createPayment(data: {
    amount: number;
    currency: string;
    description: string;
    accountId: string;
    email?: string;
  }) {
    try {
      const payload = {
        Amount: data.amount,
        Currency: data.currency,
        Description: data.description,
        AccountId: data.accountId,
        Email: data.email,
        RequireConfirmation: true,
        ...data,
      };

      const signature = this.generateSignature(payload);

      const response = await axios.post(
        `${this.apiUrl}/payments/charge`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CP-API-KEY': this.publicId,
            'X-CP-SIGNATURE': signature,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error creating payment:', error);
      throw error;
    }
  }

  async createSubscription(data: {
    amount: number;
    currency: string;
    description: string;
    accountId: string;
    email?: string;
    interval: 'Day' | 'Week' | 'Month';
    period: number;
  }) {
    try {
      const payload = {
        Amount: data.amount,
        Currency: data.currency,
        Description: data.description,
        AccountId: data.accountId,
        Email: data.email,
        RequireConfirmation: true,
        Interval: data.interval,
        Period: data.period,
        ...data,
      };

      const signature = this.generateSignature(payload);

      const response = await axios.post(
        `${this.apiUrl}/subscriptions/create`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CP-API-KEY': this.publicId,
            'X-CP-SIGNATURE': signature,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error creating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      const payload = {
        Id: subscriptionId,
      };

      const signature = this.generateSignature(payload);

      const response = await axios.post(
        `${this.apiUrl}/subscriptions/cancel`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CP-API-KEY': this.publicId,
            'X-CP-SIGNATURE': signature,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error canceling subscription:', error);
      throw error;
    }
  }

  validateWebhookSignature(payload: any, signature: string): boolean {
    const calculatedSignature = this.generateSignature(payload);
    return calculatedSignature === signature;
  }
} 