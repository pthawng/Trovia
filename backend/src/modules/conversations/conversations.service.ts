import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMessageDto } from './dto/conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ tenantId: userId }, { landlordId: userId }],
      },
      include: {
        property: {
          select: { title: true, images: true, address: true, city: true },
        },
        rentalRequest: {
          select: {
            status: true,
            moveInDate: true,
            rentalDurationMonths: true,
          },
        },
        tenant: {
          select: { fullName: true, avatarUrl: true },
        },
        landlord: {
          select: { fullName: true, avatarUrl: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((c) => ({
      ...c,
      lastMessage: c.messages[0] || null,
    }));
  }

  async findOne(id: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        property: { include: { images: true } },
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

    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId: id,
          senderId,
          type: dto.type || 'TEXT',
          content: dto.content,
          metadata: dto.metadata || undefined,
        },
      });

      await tx.conversation.update({
        where: { id },
        data: { updatedAt: new Date() },
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
          metadata: { conversationId: id, messageId: message.id },
        },
      });

      return message;
    });
  }

  async markRead(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }
}
