import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConversationsService } from './conversations.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ConversationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ConversationGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => ConversationsService))
    private readonly conversationsService: ConversationsService,
  ) {}

  async handleConnection(client: Socket) {
    const token = this.extractToken(client);
    if (!token) {
      this.logger.warn(`Client connection rejected: missing token in socket handshake.`);
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret:
          process.env.JWT_ACCESS_SECRET ||
          'trovia_super_secret_access_key_faang_level',
      });
      client.data.user = payload;
      const userId = payload.sub || payload.id;
      
      // Scalable room per-user to support targeted emits (e.g. unread count badges)
      await client.join(`user_${userId}`);
      this.logger.log(`Client ${client.id} successfully authorized as user_${userId}`);
    } catch (error) {
      this.logger.warn(`Client connection rejected: invalid or expired token. Details: ${error.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private extractToken(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    const tokenQuery = client.handshake.query.token as string;
    if (tokenQuery) {
      return tokenQuery;
    }
    return client.handshake.auth?.token;
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      client.disconnect(true);
      return;
    }
    const userId = user.sub || user.id;

    try {
      // Participant check using standard service logic
      await this.conversationsService.findOne(conversationId, userId);
      
      await client.join(`conversation_${conversationId}`);
      this.logger.log(`User ${userId} joined room conversation_${conversationId}`);
      return { status: 'joined', conversationId };
    } catch (error) {
      this.logger.warn(`User ${userId} rejected from conversation room ${conversationId}: ${error.message}`);
      client.emit('error', { message: 'Unauthorized room entry' });
    }
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`conversation_${conversationId}`);
    this.logger.log(`Client ${client.id} left room conversation_${conversationId}`);
    return { status: 'left', conversationId };
  }

  async broadcastNewMessage(conversationId: string, message: any) {
    this.server.to(`conversation_${conversationId}`).emit('newMessage', message);
  }

  async broadcastMessageRead(conversationId: string) {
    this.server.to(`conversation_${conversationId}`).emit('messageRead', { conversationId, readAt: new Date() });
  }

  async emitUnreadCount(userId: string, count: number) {
    this.server.to(`user_${userId}`).emit('unreadCountUpdated', { userId, count });
  }

  async emitConversationUpdated(userId: string, conversation: any) {
    this.server.to(`user_${userId}`).emit('conversationUpdated', conversation);
  }
}
