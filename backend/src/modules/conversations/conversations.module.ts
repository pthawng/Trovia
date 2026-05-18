import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { PrismaModule } from '../../database/prisma.module';
import { ConversationGateway } from './conversation.gateway';
import { MessageGateway } from './message.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationGateway, MessageGateway],
  exports: [ConversationsService, ConversationGateway, MessageGateway],
})
export class ConversationsModule {}
