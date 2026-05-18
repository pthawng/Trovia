import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SavedPropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async save(tenantId: string, propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.deletedAt) {
      throw new NotFoundException('Property not found');
    }

    return this.prisma.savedProperty.upsert({
      where: {
        tenantId_propertyId: { tenantId, propertyId },
      },
      update: {},
      create: { tenantId, propertyId },
    });
  }

  async unsave(tenantId: string, propertyId: string) {
    const record = await this.prisma.savedProperty.findUnique({
      where: {
        tenantId_propertyId: { tenantId, propertyId },
      },
    });

    if (!record) {
      throw new NotFoundException('Saved property record not found');
    }

    await this.prisma.savedProperty.delete({
      where: {
        tenantId_propertyId: { tenantId, propertyId },
      },
    });

    return { message: 'Property unsaved successfully' };
  }

  async getSavedListings(tenantId: string) {
    const saved = await this.prisma.savedProperty.findMany({
      where: { tenantId },
      include: {
        property: {
          include: {
            images: { orderBy: { order: 'asc' } },
            rooms: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return saved.map((s) => s.property);
  }
}
