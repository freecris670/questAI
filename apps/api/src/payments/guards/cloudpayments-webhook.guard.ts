import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CloudPaymentsWebhookGuard implements CanActivate {
  private readonly logger = new Logger(CloudPaymentsWebhookGuard.name);
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('CLOUDPAYMENTS_SECRET_KEY');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['content-hmac'];
    const body = request.body;

    if (!signature || !body) {
      this.logger.error('Missing signature or body in webhook request');
      throw new UnauthorizedException('Missing signature or body');
    }

    const isValid = this.validateSignature(body, signature);

    if (!isValid) {
      this.logger.error('Invalid webhook signature', {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }

  private validateSignature(body: any, signature: string): boolean {
    const sortedData = Object.keys(body)
      .sort()
      .reduce((acc, key) => {
        acc[key] = body[key];
        return acc;
      }, {});

    const signatureString = Object.entries(sortedData)
      .map(([key, value]) => `${key}=${value}`)
      .join(';');

    const calculatedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(signatureString)
      .digest('base64');

    return calculatedSignature === signature;
  }
} 