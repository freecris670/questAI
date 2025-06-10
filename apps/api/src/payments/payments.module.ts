import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CloudPaymentsService } from './cloudpayments.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    SupabaseModule,
    AuthModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, CloudPaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {} 