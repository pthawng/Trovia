import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger, forwardRef } from '@nestjs/common';
import { ConversationsService } from './conversations.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessageGateway {
  private readonly logger = new Logger(MessageGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => ConversationsService))
    private readonly conversationsService: ConversationsService,
  ) {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { conversationId: string; content: string; type?: string; metadata?: any },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      client.disconnect(true);
      return;
    }
    const senderId = user.sub || user.id;

    try {
      // Rule 2: DB persistence must succeed before any emissions are triggered
      const message = await this.conversationsService.sendMessage(
        data.conversationId,
        senderId,
        {
          content: data.content,
          type: (data.type as any) || 'TEXT',
          metadata: data.metadata,
        },
      );

      // Load full conversation profile with relational items for sidebar updates
      const conversation = await this.conversationsService.findOne(data.conversationId, senderId);

      // Rule 2 check: DB successful, now emit
      this.server.to(`conversation_${data.conversationId}`).emit('newMessage', message);

      const { tenantId, landlordId } = conversation;
      const conversationUpdatePayload = {
        ...conversation,
        lastMessage: message,
      };

      // Notify both participant sidebar feeds
      this.server.to(`user_${tenantId}`).emit('conversationUpdated', conversationUpdatePayload);
      this.server.to(`user_${landlordId}`).emit('conversationUpdated', conversationUpdatePayload);

      // Update the unread metric for the other participant
      const recipientId = senderId === tenantId ? landlordId : tenantId;
      const unread = await this.conversationsService.getUnreadCount(recipientId);
      this.server.to(`user_${recipientId}`).emit('unreadCountUpdated', {
        userId: recipientId,
        count: unread.count,
      });

      return { status: 'success', message };
    } catch (error) {
      this.logger.error(`WS SendMessage exception: ${error.message}`);
      client.emit('error', { message: 'Không thể gửi tin nhắn.' });
    }
  }

  @SubscribeMessage('typingStart')
  handleTypingStart(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) return;
    const userId = user.sub || user.id;

    // Rule 5: typing states are volatile only and broadcast to peer in the room
    client.to(`conversation_${data.conversationId}`).emit('userTyping', {
      conversationId: data.conversationId,
      userId,
      isTyping: true,
    });
  }

  @SubscribeMessage('typingStop')
  handleTypingStop(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) return;
    const userId = user.sub || user.id;

    // Rule 5: typing states are volatile only and broadcast to peer in the room
    client.to(`conversation_${data.conversationId}`).emit('userTyping', {
      conversationId: data.conversationId,
      userId,
      isTyping: false,
    });
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) return;
    const userId = user.sub || user.id;

    try {
      // Persist read states to Database first
      await this.conversationsService.markRead(data.conversationId, userId);

      // Send status to conversation room
      this.server.to(`conversation_${data.conversationId}`).emit('messageRead', {
        conversationId: data.conversationId,
        readAt: new Date(),
      });

      // Update badge states for reader
      const unread = await this.conversationsService.getUnreadCount(userId);
      this.server.to(`user_${userId}`).emit('unreadCountUpdated', {
        userId,
        count: unread.count,
      });

      return { status: 'success' };
    } catch (error) {
      this.logger.error(`WS MarkRead exception: ${error.message}`);
    }
  }
}
