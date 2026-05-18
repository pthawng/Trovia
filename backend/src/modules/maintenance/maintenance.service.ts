import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMaintenanceDto } from './dto/maintenance.dto';
import { MaintenanceStatus } from '@prisma/client';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateMaintenanceDto) {
    // 1. Verify property exists
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // 2. Optional: verify room belongs to property
    if (dto.roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: dto.roomId },
      });
      if (!room || room.propertyId !== dto.propertyId) {
        throw new NotFoundException('Room not found on this property');
      }
    }

    // 3. Create maintenance request
    return this.prisma.maintenanceRequest.create({
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
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            phone: true,
          },
        },
      },
    });
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
      include: {
        property: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    // Ownership check: must be either the landlord of the property or the tenant who made the request
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
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            phone: true,
          },
        },
      },
    });
  }

  async update(id: string, userId: string, dto: any) {
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
      throw new ForbiddenException('Access denied. You do not own this maintenance request.');
    }

    const updatedData: any = {};
    if (dto.status !== undefined) {
      if (isTenant && dto.status !== MaintenanceStatus.CANCELLED) {
        throw new ForbiddenException('Tenant can only cancel their own maintenance request.');
      }
      updatedData.status = dto.status;
    }
    if (dto.assignedTo !== undefined) {
      if (!isLandlord) throw new ForbiddenException('Only landlord can assign personnel.');
      updatedData.assignedTo = dto.assignedTo;
    }
    if (dto.comment !== undefined) {
      if (!isLandlord) throw new ForbiddenException('Only landlord can add notes/comments.');
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

    // Notify the other user
    const notifyUserId = isLandlord ? request.tenantId : request.property.landlordId;
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

    return updated;
  }
}
