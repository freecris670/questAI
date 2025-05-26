import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import { SupabaseAuthGuard } from './supabase.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SupabaseService, SupabaseAuthGuard],
  exports: [SupabaseService, SupabaseAuthGuard],
})
export class SupabaseModule {}

// Re-экспорт сервисов и guard для более удобного импорта
export { SupabaseService } from './supabase.service';
export { SupabaseAuthGuard } from './supabase.guard';
export { User } from './user.decorator';
