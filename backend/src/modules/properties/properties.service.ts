import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { RolesService } from '../roles/roles.service';
import { PropertyStatus } from '@prisma/client';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolesService: RolesService,
  ) {}

  async create(landlordId: string, dto: CreatePropertyDto) {
    // 1. Check if landlord is active
    await this.rolesService.checkLandlordActive(landlordId);

    // 2. Create property
    const property = await this.prisma.property.create({
      data: {
        landlordId,
        title: dto.title,
        description: dto.description,
        address: dto.address,
        city: dto.city,
        district: dto.district,
        ward: dto.ward,
        latitude: dto.latitude,
        longitude: dto.longitude,
        type: dto.type,
        status: dto.status || PropertyStatus.DRAFT,
        totalFloors: dto.totalFloors !== undefined ? dto.totalFloors : 1,
        totalUnits: dto.totalUnits !== undefined ? dto.totalUnits : 1,
        hasParking: dto.hasParking !== undefined ? dto.hasParking : true,
        utilities: dto.utilities,
        rules: dto.rules,
        images: dto.images
          ? {
              createMany: {
                data: dto.images.map((url, order) => ({ url, order })),
              },
            }
          : undefined,
        propertyAmenities: dto.amenities
          ? {
              createMany: {
                data: dto.amenities.map((amenityId) => ({ amenityId })),
              },
            }
          : undefined,
      },
      include: {
        images: true,
        propertyAmenities: {
          include: { amenity: true },
        },
      },
    });

    return property;
  }

  async findOne(id: string, userId?: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
        propertyAmenities: {
          include: { amenity: true },
        },
        rooms: true,
        landlord: {
          include: {
            user: {
              select: {
                fullName: true,
                avatarUrl: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!property || property.deletedAt) {
      throw new NotFoundException('Property not found');
    }

    // Business Rule: Draft properties are visible only to owners
    if (
      property.status === PropertyStatus.DRAFT &&
      property.landlordId !== userId
    ) {
      throw new ForbiddenException(
        'Access denied. Draft listings are only visible to the landlord.',
      );
    }

    return property;
  }

  async update(id: string, landlordId: string, dto: UpdatePropertyDto) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property || property.deletedAt) {
      throw new NotFoundException('Property not found');
    }

    // Ownership check
    if (property.landlordId !== landlordId) {
      throw new ForbiddenException(
        'Access denied. You are not the owner of this property.',
      );
    }

    // Update simple fields and handle nested images/amenities transactionally
    return this.prisma.$transaction(async (tx) => {
      // Clear and re-insert images if provided
      if (dto.images !== undefined) {
        await tx.propertyImage.deleteMany({ where: { propertyId: id } });
        if (dto.images.length > 0) {
          await tx.propertyImage.createMany({
            data: dto.images.map((url, order) => ({
              propertyId: id,
              url,
              order,
            })),
          });
        }
      }

      // Clear and re-insert amenities if provided
      if (dto.amenities !== undefined) {
        await tx.propertyAmenity.deleteMany({ where: { propertyId: id } });
        if (dto.amenities.length > 0) {
          await tx.propertyAmenity.createMany({
            data: dto.amenities.map((amenityId) => ({
              propertyId: id,
              amenityId,
            })),
          });
        }
      }

      return tx.property.update({
        where: { id },
        data: {
          title: dto.title !== undefined ? dto.title : property.title,
          description:
            dto.description !== undefined
              ? dto.description
              : property.description,
          address: dto.address !== undefined ? dto.address : property.address,
          city: dto.city !== undefined ? dto.city : property.city,
          district:
            dto.district !== undefined ? dto.district : property.district,
          ward: dto.ward !== undefined ? dto.ward : property.ward,
          latitude:
            dto.latitude !== undefined ? dto.latitude : property.latitude,
          longitude:
            dto.longitude !== undefined ? dto.longitude : property.longitude,
          type: dto.type !== undefined ? dto.type : property.type,
          status: dto.status !== undefined ? dto.status : property.status,
          totalFloors: dto.totalFloors !== undefined ? dto.totalFloors : property.totalFloors,
          totalUnits: dto.totalUnits !== undefined ? dto.totalUnits : property.totalUnits,
          hasParking: dto.hasParking !== undefined ? dto.hasParking : property.hasParking,
          utilities: dto.utilities !== undefined ? dto.utilities : property.utilities,
          rules: dto.rules !== undefined ? dto.rules : property.rules,
        },
        include: {
          images: true,
          propertyAmenities: {
            include: { amenity: true },
          },
        },
      });
    });
  }

  async delete(id: string, landlordId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property || property.deletedAt) {
      throw new NotFoundException('Property not found');
    }

    if (property.landlordId !== landlordId) {
      throw new ForbiddenException(
        'Access denied. You are not the owner of this property.',
      );
    }

    // Soft delete
    await this.prisma.property.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Property deleted successfully' };
  }

  async findAll(filters: { landlordId?: string; status?: PropertyStatus }) {
    return this.prisma.property.findMany({
      where: {
        landlordId: filters.landlordId,
        status: filters.status,
        deletedAt: null,
      },
      include: {
        images: true,
        rooms: true,
        propertyAmenities: {
          include: { amenity: true },
        },
      },
    });
  }

  async getAmenities() {
    return this.prisma.amenity.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async publish(id: string, landlordId: string) {
    // 1. Check if landlord is active
    await this.rolesService.checkLandlordActive(landlordId);

    // 2. Fetch property with its child elements
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        rooms: true,
        images: true,
        propertyAmenities: true,
      },
    });

    if (!property || property.deletedAt) {
      throw new NotFoundException('Property not found');
    }

    // 3. Ownership check
    if (property.landlordId !== landlordId) {
      throw new ForbiddenException(
        'Access denied. You are not the owner of this property.',
      );
    }

    // 4. Required address, city, district
    if (!property.address || !property.city || !property.district) {
      throw new BadRequestException(
        'Property must have required address, city, and district before publishing.',
      );
    }

    // 5. Must have at least 1 image
    if (property.images.length === 0) {
      throw new BadRequestException(
        'Property must have at least one image before publishing.',
      );
    }

    // 6. Must have at least 1 amenity
    if (property.propertyAmenities.length === 0) {
      throw new BadRequestException(
        'Property must have at least one amenity before publishing.',
      );
    }

    // 7. Must have at least 1 room, and at least one available room
    if (property.rooms.length === 0) {
      throw new BadRequestException(
        'Property must have at least one room/unit before publishing.',
      );
    }

    const hasAvailableRoom = property.rooms.some(
      (r) => r.isAvailable && r.status === 'AVAILABLE',
    );
    if (!hasAvailableRoom) {
      throw new BadRequestException(
        'Property must have at least one available room/unit before publishing.',
      );
    }

    // 8. Update property status to PUBLISHED
    return this.prisma.property.update({
      where: { id },
      data: { status: PropertyStatus.PUBLISHED },
      include: {
        images: true,
        rooms: true,
        propertyAmenities: {
          include: { amenity: true },
        },
      },
    });
  }
}
