import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

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
          select: { fullName: true, email: true, phone: true },
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
          select: { fullName: true, email: true, phone: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }
}
