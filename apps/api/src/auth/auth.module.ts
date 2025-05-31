import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { QuestsModule } from '../quests/quests.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [QuestsModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
