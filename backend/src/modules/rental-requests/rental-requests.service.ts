import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateRentalRequestDto,
  UpdateRentalRequestStatusDto,
} from './dto/rental-request.dto';
import { RentalRequestStatus } from '@prisma/client';

@Injectable()
export class RentalRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateRentalRequestDto) {
    // 1. Fetch the property to find landlordId
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });

    if (!property || property.status !== 'PUBLISHED') {
      throw new NotFoundException('Property not found or not published');
    }

    // 2. Validate: Tenant cannot request own property
    if (property.landlordId === tenantId) {
      throw new BadRequestException(
        'Bạn không thể gửi yêu cầu thuê cho tài sản của chính mình.',
      );
    }

    // 3. Validate: Room must exist and be available (if room is provided)
    if (dto.roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: dto.roomId },
      });
      if (!room || !room.isAvailable) {
        throw new NotFoundException('Phòng không có sẵn hoặc không tồn tại.');
      }
    }

    // 4. Validate: Tenant cannot create duplicate active request for same property/room
    const existingActiveRequest = await this.prisma.rentalRequest.findFirst({
      where: {
        tenantId,
        propertyId: dto.propertyId,
        roomId: dto.roomId || null,
        status: {
          in: [RentalRequestStatus.PENDING, RentalRequestStatus.IN_DISCUSSION],
        },
      },
    });

    if (existingActiveRequest) {
      throw new BadRequestException(
        'Bạn đã có một yêu cầu thuê đang chờ xử lý cho phòng/nhà này.',
      );
    }

    // 5. Transaction: RentalRequest + Conversation + Message + Notification
    return this.prisma.$transaction(async (tx) => {
      // Create request
      const request = await tx.rentalRequest.create({
        data: {
          tenantId,
          landlordId: property.landlordId,
          propertyId: dto.propertyId,
          roomId: dto.roomId || null,
          moveInDate: new Date(dto.moveInDate),
          rentalDurationMonths: dto.rentalDurationMonths,
          message: dto.message || null,
          phone: dto.phone || null,
          status: RentalRequestStatus.PENDING,
        },
        include: {
          property: true,
          room: true,
          tenant: {
            select: { fullName: true, email: true, phone: true },
          },
        },
      });

      // Create conversation
      const conversation = await tx.conversation.create({
        data: {
          rentalRequestId: request.id,
          propertyId: dto.propertyId,
          tenantId,
          landlordId: property.landlordId,
          status: 'OPEN',
        },
      });

      // Create system message
      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: tenantId, // Standard message creator for db constraint, but marked as SYSTEM
          type: 'SYSTEM',
          content: 'Yêu cầu thuê đã được gửi',
        },
      });

      // Notify landlord
      await tx.notification.create({
        data: {
          userId: property.landlordId,
          type: 'RENTAL_REQUEST_CREATED',
          title: 'Yêu cầu thuê mới',
          body: `Bạn nhận được yêu cầu thuê mới từ ${request.tenant?.fullName || 'Người thuê'} cho căn hộ ${property.title}.`,
          metadata: JSON.stringify({
            rentalRequestId: request.id,
            conversationId: conversation.id,
          }),
        },
      });

      return { request, conversationId: conversation.id };
    });
  }

  async findAllForTenant(tenantId: string) {
    return this.prisma.rentalRequest.findMany({
      where: { tenantId },
      include: {
        property: {
          include: { images: true },
        },
        room: true,
        conversations: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllForLandlord(landlordId: string) {
    return this.prisma.rentalRequest.findMany({
      where: { landlordId },
      include: {
        property: {
          include: { images: true },
        },
        room: true,
        tenant: {
          select: {
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        conversations: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    id: string,
    userId: string,
    dto: UpdateRentalRequestStatusDto,
  ) {
    const request = await this.prisma.rentalRequest.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!request) {
      throw new NotFoundException('Yêu cầu thuê không tồn tại.');
    }

    // Auth validation
    if (dto.status === RentalRequestStatus.CANCELLED) {
      if (request.tenantId !== userId) {
        throw new ForbiddenException(
          'Bạn không có quyền hủy yêu cầu thuê này.',
        );
      }
    } else {
      if (request.landlordId !== userId) {
        throw new ForbiddenException(
          'Bạn không phải là chủ của bất động sản này để thực hiện thao tác.',
        );
      }
    }

    // Find conversation to log message
    const conversation = await this.prisma.conversation.findFirst({
      where: { rentalRequestId: id },
    });

    return this.prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.rentalRequest.update({
        where: { id },
        data: { status: dto.status },
        include: { property: true },
      });

      if (conversation) {
        let msgContent = 'Yêu cầu thuê đã thay đổi trạng thái';
        if (dto.status === RentalRequestStatus.ACCEPTED) {
          msgContent = 'Yêu cầu thuê đã được chấp nhận';
        } else if (dto.status === RentalRequestStatus.REJECTED) {
          msgContent = 'Yêu cầu thuê đã bị từ chối';
        } else if (dto.status === RentalRequestStatus.CANCELLED) {
          msgContent = 'Yêu cầu thuê đã bị hủy bởi người thuê';
        } else if (dto.status === RentalRequestStatus.IN_DISCUSSION) {
          msgContent = 'Chủ nhà đã bắt đầu thảo luận thêm';
        }

        await tx.message.create({
          data: {
            conversationId: conversation.id,
            senderId: userId,
            type: 'SYSTEM',
            content: msgContent,
          },
        });
      }

      // Notify other party
      const notifyUserId =
        dto.status === RentalRequestStatus.CANCELLED
          ? request.landlordId
          : request.tenantId;
      let notifyTitle = 'Cập nhật yêu cầu thuê';
      let notifyBody = `Yêu cầu thuê của bạn cho ${request.property.title} đã được cập nhật sang trạng thái: ${dto.status}`;

      if (dto.status === RentalRequestStatus.ACCEPTED) {
        notifyTitle = 'Yêu cầu thuê được CHẤP NHẬN';
        notifyBody = `Chủ nhà đã CHẤP NHẬN yêu cầu thuê của bạn cho ${request.property.title}.`;
      } else if (dto.status === RentalRequestStatus.REJECTED) {
        notifyTitle = 'Yêu cầu thuê bị TỪ CHỐI';
        notifyBody = `Yêu cầu thuê của bạn cho ${request.property.title} đã bị từ chối.`;
      }

      await tx.notification.create({
        data: {
          userId: notifyUserId,
          type: 'RENTAL_REQUEST_STATUS_UPDATED',
          title: notifyTitle,
          body: notifyBody,
          metadata: JSON.stringify({ rentalRequestId: id, status: dto.status }),
        },
      });

      return updatedRequest;
    });
  }
}
