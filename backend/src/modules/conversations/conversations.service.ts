import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMessageDto } from './dto/conversation.dto';
import { ConversationGateway } from './conversation.gateway';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ConversationGateway))
    private readonly gateway: ConversationGateway,
  ) {}

  async findAllForUser(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ tenantId: userId }, { landlordId: userId }],
      },
      include: {
        property: {
          select: { id: true, title: true, images: true, address: true, city: true },
        },
        room: {
          select: { id: true, title: true, floor: true, roomNumber: true },
        },
        rentalRequest: {
          select: {
            id: true,
            status: true,
            moveInDate: true,
            rentalDurationMonths: true,
          },
        },
        tenant: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        landlord: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return conversations.map((c) => ({
      ...c,
      lastMessage: c.messages[0] || null,
    }));
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: {
        conversation: {
          OR: [
            { tenantId: userId },
            { landlordId: userId },
          ],
        },
        senderId: { not: userId },
        readAt: null,
      },
    });
    return { count };
  }

  async findOne(id: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        property: { include: { images: true } },
        room: { select: { id: true, title: true, floor: true, roomNumber: true, price: true } },
        rentalRequest: { include: { room: true } },
        tenant: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true },
        },
        landlord: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Cuộc hội thoại không tồn tại.');
    }

    if (
      conversation.tenantId !== userId &&
      conversation.landlordId !== userId
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập cuộc hội thoại này.',
      );
    }

    return conversation;
  }

  async findMessages(id: string, userId: string) {
    // Validate authorization
    await this.findOne(id, userId);

    const messages = await this.prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((m) => ({
      ...m,
      metadata: m.metadata || null,
    }));
  }

  async sendMessage(id: string, senderId: string, dto: CreateMessageDto) {
    const conversation = await this.findOne(id, senderId);

    // Determine sender role context automatically and securely
    let senderRoleContext: 'TENANT' | 'LANDLORD' | 'SYSTEM' = 'SYSTEM';
    if (senderId === conversation.tenantId) {
      senderRoleContext = 'TENANT';
    } else if (senderId === conversation.landlordId) {
      senderRoleContext = 'LANDLORD';
    }

    const message = await this.prisma.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          conversationId: id,
          senderId,
          senderRoleContext,
          type: dto.type || 'TEXT',
          content: dto.content,
          metadata: dto.metadata || undefined,
        },
      });

      await tx.conversation.update({
        where: { id },
        data: { 
          updatedAt: new Date(),
          lastMessageAt: createdMessage.createdAt,
        },
      });

      // Find other participant's ID
      const receiverId =
        conversation.tenantId === senderId
          ? conversation.landlordId
          : conversation.tenantId;
      const senderName =
        conversation.tenantId === senderId
          ? conversation.tenant.fullName
          : conversation.landlord.fullName;

      // Notify the receiver
      await tx.notification.create({
        data: {
          userId: receiverId,
          type: 'NEW_MESSAGE',
          title: `Tin nhắn mới từ ${senderName || 'Người liên hệ'}`,
          body:
            dto.content.length > 50
              ? `${dto.content.slice(0, 50)}...`
              : dto.content,
          metadata: JSON.stringify({ conversationId: id, messageId: createdMessage.id }),
        },
      });

      return createdMessage;
    });

    // Fire-and-forget: Emit real-time broadcasts on successful DB transaction (Rule 2)
    try {
      this.gateway.broadcastNewMessage(id, message);
      
      const updatedConv = await this.findOne(id, senderId);
      const conversationUpdatePayload = {
        ...updatedConv,
        lastMessage: message,
      };

      this.gateway.emitConversationUpdated(updatedConv.tenantId, conversationUpdatePayload);
      this.gateway.emitConversationUpdated(updatedConv.landlordId, conversationUpdatePayload);

      const receiverId = senderId === updatedConv.tenantId ? updatedConv.landlordId : updatedConv.tenantId;
      const unread = await this.getUnreadCount(receiverId);
      this.gateway.emitUnreadCount(receiverId, unread.count);
    } catch (wsError) {
      // WS emission error shouldn't fail the API request, just log it
      console.error(`Failed to broadcast new message via WS in service: ${wsError.message}`);
    }

    return message;
  }

  async markRead(id: string, userId: string) {
    const conversation = await this.findOne(id, userId);

    const result = await this.prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    // Fire-and-forget: Emit real-time notifications to readers
    try {
      this.gateway.broadcastMessageRead(id);

      const unread = await this.getUnreadCount(userId);
      this.gateway.emitUnreadCount(userId, unread.count);
    } catch (wsError) {
      console.error(`Failed to broadcast read status via WS in service: ${wsError.message}`);
    }

    return result;
  }
}
