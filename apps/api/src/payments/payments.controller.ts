import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Headers,
  Get,
  Request,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CloudPaymentsWebhookGuard } from './guards/cloudpayments-webhook.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('subscriptions')
  async createSubscription(
    @Body() body: { planId: string },
    @Headers('user-id') userId: string,
  ) {
    return this.paymentsService.createSubscription(userId, body.planId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscriptions/:subscriptionId/cancel')
  async cancelSubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.paymentsService.cancelSubscription(subscriptionId);
  }

  @UseGuards(CloudPaymentsWebhookGuard)
  @Post('webhooks/cloudpayments')
  async handleWebhook(
    @Body() payload: any,
    @Headers('content-hmac') signature: string,
  ) {
    return this.paymentsService.handleWebhook(payload, signature);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscriptions')
  async getUserSubscriptions(@Headers('user-id') userId: string) {
    return this.paymentsService.getUserSubscriptions(userId);
  }

  @Get('plans')
  async getPlans() {
    return this.paymentsService.getPlans();
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('subscriptions/current')
  async getCurrentSubscription(@Request() req: any) {
    if (!req.user) {
      return null;
    }
    
    return this.paymentsService.getCurrentSubscription(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscriptions/:subscriptionId')
  async getSubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.paymentsService.getSubscription(subscriptionId);
  }
} 