import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TenancyStatus, ContractStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { baseTemplate, heading, para, infoCard } from '../mail/templates/shared/base.template';

@Injectable()
export class TenanciesService {
  private readonly logger = new Logger(TenanciesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

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
      throw new ForbiddenException(
        'Bạn không có quyền truy cập hồ sơ thuê phòng này.',
      );
    }

    return tenancy;
  }

  async requestMoveOut(id: string, tenantId: string) {
    const tenancy = await this.prisma.tenancy.findUnique({
      where: { id },
      include: {
        contract: true,
        property: true,
        room: true,
        landlord: { select: { id: true, email: true, fullName: true } },
      },
    });

    if (!tenancy) {
      throw new NotFoundException('Hồ sơ thuê phòng không tồn tại.');
    }

    if (tenancy.tenantId !== tenantId) {
      throw new ForbiddenException(
        'Chỉ người thuê mới có quyền yêu cầu trả phòng.',
      );
    }

    if (tenancy.status !== TenancyStatus.ACTIVE) {
      throw new BadRequestException(
        'Hợp đồng thuê này đã kết thúc hoặc không còn hoạt động.',
      );
    }

    if (tenancy.moveOutRequested) {
      throw new BadRequestException(
        'Bạn đã gửi yêu cầu trả phòng trước đó rồi.',
      );
    }

    // Fetch tenant for email
    const tenantUser = await this.prisma.user.findUnique({
      where: { id: tenantId },
      select: { id: true, email: true, fullName: true },
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      const u = await tx.tenancy.update({
        where: { id },
        data: { moveOutRequested: true },
        include: { contract: true, property: true, room: true },
      });

      await tx.message.create({
        data: {
          conversationId: tenancy.contract.conversationId,
          senderId: tenantId,
          type: 'SYSTEM',
          content: `Người thuê đã gửi yêu cầu TRẢ PHÒNG / KẾT THÚC HỢP ĐỒNG THUÊ cho phòng ${u.room.title}. Đang chờ chủ nhà phê duyệt.`,
          metadata: JSON.stringify({ tenancyId: id }),
        },
      });

      await tx.notification.create({
        data: {
          userId: tenancy.landlordId,
          type: 'MOVE_OUT_REQUESTED',
          title: 'Yêu cầu trả phòng mới 🏠',
          body: `Người thuê phòng tại ${tenancy.property.title} đã gửi yêu cầu trả phòng và kết thúc hợp đồng thuê.`,
          metadata: JSON.stringify({ tenancyId: id }),
        },
      });

      return u;
    });

    // Email landlord (fire-and-forget)
    if (tenancy.landlord && tenantUser) {
      this.mailService
        .sendMoveOutRequestEmail(tenancy.landlord, {
          id,
          propertyTitle: tenancy.property.title,
          roomTitle: tenancy.room.title,
          tenantName: tenantUser.fullName || 'Người thuê',
        })
        .catch((err) =>
          this.logger.error('[Tenancies] sendMoveOutRequestEmail', err),
        );
    }

    return updated;
  }

  async approveMoveOut(id: string, landlordId: string) {
    const tenancy = await this.prisma.tenancy.findUnique({
      where: { id },
      include: {
        contract: true,
        property: true,
        room: true,
        tenant: { select: { id: true, email: true, fullName: true } },
      },
    });

    if (!tenancy) {
      throw new NotFoundException('Hồ sơ thuê phòng không tồn tại.');
    }

    if (tenancy.landlordId !== landlordId) {
      throw new ForbiddenException(
        'Chỉ chủ nhà sở hữu mới có quyền phê duyệt trả phòng.',
      );
    }

    if (tenancy.status !== TenancyStatus.ACTIVE) {
      throw new BadRequestException(
        'Hợp đồng thuê này đã kết thúc hoặc không còn hoạt động.',
      );
    }

    const updatedTenancy = await this.prisma.$transaction(async (tx) => {
      const u = await tx.tenancy.update({
        where: { id },
        data: {
          status: TenancyStatus.ENDED,
          endedAt: new Date(),
        },
        include: { contract: true, property: true, room: true },
      });

      await tx.contract.update({
        where: { id: tenancy.contractId },
        data: { status: ContractStatus.TERMINATED },
      });

      await tx.room.update({
        where: { id: tenancy.roomId },
        data: { isAvailable: true, status: 'AVAILABLE' },
      });

      await tx.message.create({
        data: {
          conversationId: tenancy.contract.conversationId,
          senderId: landlordId,
          type: 'SYSTEM',
          content: `Chủ nhà đã PHÊ DUYỆT yêu cầu trả phòng cho phòng ${tenancy.room.title}. Hợp đồng thuê kết thúc. Căn phòng hiện trống và sẵn sàng cho thuê mới.`,
          metadata: JSON.stringify({ tenancyId: id }),
        },
      });

      await tx.notification.create({
        data: {
          userId: tenancy.tenantId,
          type: 'MOVE_OUT_APPROVED',
          title: 'Yêu cầu trả phòng ĐÃ ĐƯỢC DUYỆT ✔',
          body: `Chủ nhà đã phê duyệt yêu cầu trả phòng của bạn tại ${tenancy.property.title}. Hợp đồng thuê kết thúc tốt đẹp.`,
          metadata: JSON.stringify({ tenancyId: id }),
        },
      });

      return u;
    });

    // Email tenant (fire-and-forget) — move-out approved
    // (reuse maintenanceUpdated shape since no specific template needed for move-out approved to tenant)
    // We can use a direct send here with a custom message
    if (tenancy.tenant) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const subject = 'Yêu cầu trả phòng đã được duyệt — Trovia';
      const html = baseTemplate({
        subject,
        previewText: `Chủ nhà đã phê duyệt trả phòng tại ${tenancy.property.title}`,
        bodyHtml: `
          ${heading('Yêu cầu trả phòng đã được duyệt ✔')}
          ${para(`Xin chào <strong>${tenancy.tenant.fullName || 'bạn'}</strong>,`)}
          ${para(`Chủ nhà đã phê duyệt yêu cầu trả phòng của bạn tại <strong>${tenancy.property.title}</strong>.`)}
          ${infoCard(`
            <strong>🏠 Bất động sản:</strong> ${tenancy.property.title}<br/>
            <strong>🚪 Phòng:</strong> ${tenancy.room.title}<br/>
            <strong>📋 Trạng thái hợp đồng:</strong> <span style="color:#16a34a;">Đã kết thúc ✅</span>
          `)}
          ${para('Cảm ơn bạn đã sử dụng Trovia. Chúc bạn tìm được nơi ở mới phù hợp! 🏡')}
        `,
        ctaLabel: 'Tìm phòng mới',
        ctaUrl: `${frontendUrl}/app/explore`,
      });

      this.mailService['send']({
        to: tenancy.tenant.email,
        subject,
        html,
        templateKey: 'tenant.maintenance-updated', // closest key, logs are searchable
        recipientUserId: tenancy.tenant.id,
        metadata: { tenancyId: id, event: 'MOVE_OUT_APPROVED' },
      }).catch((err) =>
        this.logger.error('[Tenancies] approveMoveOut email tenant', err),
      );
    }

    return updatedTenancy;
  }
}
