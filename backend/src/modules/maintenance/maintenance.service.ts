import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMaintenanceDto } from './dto/maintenance.dto';
import { MaintenanceStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(tenantId: string, dto: CreateMaintenanceDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
      include: {
        landlord: {
          include: {
            user: { select: { id: true, email: true, fullName: true } },
          },
        },
      },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (dto.roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: dto.roomId },
      });
      if (!room || room.propertyId !== dto.propertyId) {
        throw new NotFoundException('Room not found on this property');
      }
    }

    const tenantUser = await this.prisma.user.findUnique({
      where: { id: tenantId },
      select: { id: true, email: true, fullName: true },
    });

    const ticket = await this.prisma.maintenanceRequest.create({
      data: {
        tenantId,
        propertyId: dto.propertyId,
        roomId: dto.roomId || null,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        images: dto.images || [],
        status: MaintenanceStatus.OPEN,
      },
      include: {
        property: true,
        room: true,
        tenant: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true },
        },
      },
    });

    // Email landlord: new maintenance request (fire-and-forget)
    const landlordUser = property.landlord?.user;
    if (landlordUser && tenantUser) {
      this.mailService
        .sendMaintenanceRequestEmail(landlordUser, {
          id: ticket.id,
          propertyTitle: property.title,
          tenantName: tenantUser.fullName || 'Người thuê',
          title: dto.title,
          priority: dto.priority ?? 'MEDIUM',
        })
        .catch((err) =>
          this.logger.error('[Maintenance] sendMaintenanceRequestEmail', err),
        );
    }

    return ticket;
  }

  async findForLandlord(landlordId: string) {
    return this.prisma.maintenanceRequest.findMany({
      where: {
        property: {
          landlordId,
        },
      },
      include: {
        property: true,
        room: true,
        tenant: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findForTenant(tenantId: string) {
    return this.prisma.maintenanceRequest.findMany({
      where: {
        tenantId,
      },
      include: {
        property: true,
        room: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(id: string, userId: string, status: MaintenanceStatus) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    const isLandlord = request.property.landlordId === userId;
    const isTenant = request.tenantId === userId;

    if (!isLandlord && !isTenant) {
      throw new ForbiddenException(
        'Access denied. You do not own this maintenance request.',
      );
    }

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: { status },
      include: {
        property: true,
        room: true,
        tenant: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true },
        },
      },
    });
  }

  async update(id: string, userId: string, dto: any) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        property: true,
        tenant: { select: { id: true, email: true, fullName: true } },
      },
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    const isLandlord = request.property.landlordId === userId;
    const isTenant = request.tenantId === userId;

    if (!isLandlord && !isTenant) {
      throw new ForbiddenException(
        'Access denied. You do not own this maintenance request.',
      );
    }

    const updatedData: any = {};
    if (dto.status !== undefined) {
      if (isTenant && dto.status !== MaintenanceStatus.CANCELLED) {
        throw new ForbiddenException(
          'Tenant can only cancel their own maintenance request.',
        );
      }
      updatedData.status = dto.status;
    }
    if (dto.assignedTo !== undefined) {
      if (!isLandlord)
        throw new ForbiddenException('Only landlord can assign personnel.');
      updatedData.assignedTo = dto.assignedTo;
    }
    if (dto.comment !== undefined) {
      if (!isLandlord)
        throw new ForbiddenException('Only landlord can add notes/comments.');
      updatedData.comment = dto.comment;
    }

    const updated = await this.prisma.maintenanceRequest.update({
      where: { id },
      data: updatedData,
      include: {
        property: true,
        room: true,
        tenant: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true },
        },
      },
    });

    // In-app notification
    const notifyUserId = isLandlord
      ? request.tenantId
      : request.property.landlordId;
    await this.prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: 'MAINTENANCE_UPDATE',
        title: `Yêu cầu sửa chữa: ${request.title}`,
        body: isLandlord
          ? `Chủ nhà đã cập nhật yêu cầu của bạn: ${dto.status || request.status}. ${dto.comment ? `Ghi chú: ${dto.comment}` : ''}`
          : `Người thuê đã cập nhật yêu cầu: ${dto.status || request.status}.`,
        metadata: JSON.stringify({ requestId: id }),
      },
    });

    // Email tenant when landlord updates (fire-and-forget)
    if (isLandlord && request.tenant) {
      this.mailService
        .sendMaintenanceUpdatedEmail(request.tenant, {
          id,
          title: request.title,
          status: dto.status ?? request.status,
          comment: dto.comment ?? null,
        })
        .catch((err) =>
          this.logger.error('[Maintenance] sendMaintenanceUpdatedEmail', err),
        );
    }

    return updated;
  }
}
