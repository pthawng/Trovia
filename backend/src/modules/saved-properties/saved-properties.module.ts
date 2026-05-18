import { Module } from '@nestjs/common';
import { SavedPropertiesService } from './saved-properties.service';
import { SavedPropertiesController } from './saved-properties.controller';

@Module({
  controllers: [SavedPropertiesController],
  providers: [SavedPropertiesService],
  exports: [SavedPropertiesService],
})
export class SavedPropertiesModule {}
