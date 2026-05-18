import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { CreateMessageDto } from './dto/conversation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('general/:landlordId')
  @ApiOperation({ summary: 'Find or create a general conversation with a landlord' })
  async findOrCreateGeneral(
    @GetUser('id') tenantId: string,
    @Param('landlordId') landlordId: string,
    @Body('propertyId') propertyId?: string,
  ) {
    return this.conversationsService.findOrCreateGeneralConversation(tenantId, landlordId, propertyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all conversations for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of conversations' })
  async findAll(@GetUser('id') userId: string) {
    return this.conversationsService.findAllForUser(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread messages count for all conversations' })
  @ApiResponse({ status: 200, description: 'Unread messages count' })
  async getUnreadCount(@GetUser('id') userId: string) {
    return this.conversationsService.getUnreadCount(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation details' })
  @ApiResponse({ status: 200, description: 'Conversation details' })
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.conversationsService.findOne(id, userId);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get all messages in a conversation' })
  @ApiResponse({ status: 200, description: 'List of messages' })
  async findMessages(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.conversationsService.findMessages(id, userId);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message in a conversation' })
  @ApiResponse({ status: 201, description: 'Message created successfully' })
  async sendMessage(
    @Param('id') id: string,
    @GetUser('id') senderId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.conversationsService.sendMessage(id, senderId, dto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark all messages in a conversation as read' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  async markRead(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.conversationsService.markRead(id, userId);
  }
}
