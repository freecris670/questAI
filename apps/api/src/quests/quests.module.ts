import { Module } from '@nestjs/common';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';
import { QuestsRepository } from './quests.repository';
import { QuestGenerationService } from './quest-generation.service';
import { TrialQuestService } from './trial-quest.service';
import { TrialQuestsRepository } from './trial-quests.repository';
import { OpenAiModule } from '../openai/openai.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule, OpenAiModule],
  controllers: [QuestsController],
  providers: [QuestsService, QuestsRepository, QuestGenerationService, TrialQuestService, TrialQuestsRepository],
  exports: [QuestsService],
})
export class QuestsModule {}
