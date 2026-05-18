import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TenancyStatus, ContractStatus } from '@prisma/client';

@Injectable()
export class TenanciesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForTenant(tenantId: string) {
    return this.prisma.tenancy.findMany({
      where: { tenantId },
      include: {
        contract: true,
        property: {
          include: { images: true },
        },
        room: true,
        landlord: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findAllForLandlord(landlordId: string) {
    return this.prisma.tenancy.findMany({
      where: { landlordId },
      include: {
        contract: true,
        property: {
          include: { images: true },
        },
        room: true,
        tenant: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const tenancy = await this.prisma.tenancy.findUnique({
      where: { id },
      include: {
        contract: true,
        property: { include: { images: true } },
        room: true,
        tenant: { select: { fullName: true, email: true, phone: true } },
        landlord: { select: { fullName: true, email: true, phone: true } },
      },
    });

    if (!tenancy) {
      throw new NotFoundException('Thông tin thuê phòng không tồn tại.');
    }

    if (tenancy.tenantId !== userId && tenancy.landlordId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập hồ sơ thuê phòng này.');
    }

    return tenancy;
  }

  async requestMoveOut(id: string, tenantId: string) {
    const tenancy = await this.prisma.tenancy.findUnique({
      where: { id },
      include: { contract: true, property: true },
    });

    if (!tenancy) {
      throw new NotFoundException('Hồ sơ thuê phòng không tồn tại.');
    }

    if (tenancy.tenantId !== tenantId) {
      throw new ForbiddenException('Chỉ người thuê mới có quyền yêu cầu trả phòng.');
    }

    if (tenancy.status !== TenancyStatus.ACTIVE) {
      throw new BadRequestException('Hợp đồng thuê này đã kết thúc hoặc không còn hoạt động.');
    }

    if (tenancy.moveOutRequested) {
      throw new BadRequestException('Bạn đã gửi yêu cầu trả phòng trước đó rồi.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Tenancy
      const updated = await tx.tenancy.update({
        where: { id },
        data: { moveOutRequested: true },
        include: { contract: true, property: true, room: true },
      });

      // 2. Add System Message in Chat Conversation
      await tx.message.create({
        data: {
          conversationId: tenancy.contract.conversationId,
          senderId: tenantId,
          type: 'SYSTEM',
          content: `Người thuê đã gửi yêu cầu TRẢ PHÒNG / KẾT THÚC HỢP ĐỒNG THUÊ cho phòng ${updated.room.title}. Đang chờ chủ nhà phê duyệt.`,
          metadata: JSON.stringify({ tenancyId: id }),
        },
      });

      // 3. Create Notification for Landlord
      await tx.notification.create({
        data: {
          userId: tenancy.landlordId,
          type: 'MOVE_OUT_REQUESTED',
          title: 'Yêu cầu trả phòng mới 🏠',
          body: `Người thuê phòng tại ${tenancy.property.title} đã gửi yêu cầu trả phòng và kết thúc hợp đồng thuê.`,
          metadata: JSON.stringify({ tenancyId: id }),
        },
      });

      return updated;
    });
  }

  async approveMoveOut(id: string, landlordId: string) {
    const tenancy = await this.prisma.tenancy.findUnique({
      where: { id },
      include: { contract: true, property: true, room: true },
    });

    if (!tenancy) {
      throw new NotFoundException('Hồ sơ thuê phòng không tồn tại.');
    }

    if (tenancy.landlordId !== landlordId) {
      throw new ForbiddenException('Chỉ chủ nhà sở hữu mới có quyền phê duyệt trả phòng.');
    }

    if (tenancy.status !== TenancyStatus.ACTIVE) {
      throw new BadRequestException('Hợp đồng thuê này đã kết thúc hoặc không còn hoạt động.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Close Tenancy: ENDED status
      const updatedTenancy = await tx.tenancy.update({
        where: { id },
        data: {
          status: TenancyStatus.ENDED,
          endedAt: new Date(),
        },
        include: { contract: true, property: true, room: true },
      });

      // 2. Terminate Contract
      await tx.contract.update({
        where: { id: tenancy.contractId },
        data: { status: ContractStatus.TERMINATED },
      });

      // 3. Make Room AVAILABLE again
      await tx.room.update({
        where: { id: tenancy.roomId },
        data: {
          isAvailable: true,
          status: 'AVAILABLE',
        },
      });

      // 4. Add System Message in Chat Conversation
      await tx.message.create({
        data: {
          conversationId: tenancy.contract.conversationId,
          senderId: landlordId,
          type: 'SYSTEM',
          content: `Chủ nhà đã PHÊ DUYỆT yêu cầu trả phòng cho phòng ${tenancy.room.title}. Hợp đồng thuê kết thúc. Căn phòng hiện trống và sẵn sàng cho thuê mới.`,
          metadata: JSON.stringify({ tenancyId: id }),
        },
      });

      // 5. Create Notification for Tenant
      await tx.notification.create({
        data: {
          userId: tenancy.tenantId,
          type: 'MOVE_OUT_APPROVED',
          title: 'Yêu cầu trả phòng ĐÃ ĐƯỢC DUYỆT ✔',
          body: `Chủ nhà đã phê duyệt yêu cầu trả phòng của bạn tại ${tenancy.property.title}. Hợp đồng thuê kết thúc tốt đẹp.`,
          metadata: JSON.stringify({ tenancyId: id }),
        },
      });

      return updatedTenancy;
    });
  }
}
