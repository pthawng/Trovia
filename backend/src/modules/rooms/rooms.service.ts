import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(propertyId: string, landlordId: string, dto: CreateRoomDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.deletedAt) {
      throw new NotFoundException('Property not found');
    }

    // Ownership check
    if (property.landlordId !== landlordId) {
      throw new ForbiddenException(
        'Access denied. You do not own this property.',
      );
    }

    return this.prisma.room.create({
      data: {
        propertyId,
        title: dto.title,
        description: dto.description,
        price: new Prisma.Decimal(dto.price),
        area: dto.area,
        deposit: new Prisma.Decimal(dto.deposit),
        capacity: dto.capacity,
        isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true,
        roomNumber: dto.roomNumber || dto.title,
        floor: dto.floor || 1,
        genderRestriction: dto.genderRestriction || "ANY",
        status: dto.status || "AVAILABLE",
        roomAmenities: dto.amenities
          ? {
              createMany: {
                data: dto.amenities.map((amenityId) => ({ amenityId })),
              },
            }
          : undefined,
      },
      include: {
        roomAmenities: {
          include: { amenity: true },
        },
      },
    });
  }

  async update(id: string, landlordId: string, dto: UpdateRoomDto) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Ownership check
    if (room.property.landlordId !== landlordId) {
      throw new ForbiddenException(
        'Access denied. You do not own the parent property.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Handle amenities
      if (dto.amenities !== undefined) {
        await tx.roomAmenity.deleteMany({ where: { roomId: id } });
        if (dto.amenities.length > 0) {
          await tx.roomAmenity.createMany({
            data: dto.amenities.map((amenityId) => ({ roomId: id, amenityId })),
          });
        }
      }

      return tx.room.update({
        where: { id },
        data: {
          title: dto.title !== undefined ? dto.title : room.title,
          description:
            dto.description !== undefined ? dto.description : room.description,
          price:
            dto.price !== undefined
              ? new Prisma.Decimal(dto.price)
              : room.price,
          area: dto.area !== undefined ? dto.area : room.area,
          deposit:
            dto.deposit !== undefined
              ? new Prisma.Decimal(dto.deposit)
              : room.deposit,
          capacity: dto.capacity !== undefined ? dto.capacity : room.capacity,
          isAvailable:
            dto.isAvailable !== undefined ? dto.isAvailable : room.isAvailable,
          roomNumber: dto.roomNumber !== undefined ? dto.roomNumber : room.roomNumber,
          floor: dto.floor !== undefined ? dto.floor : room.floor,
          genderRestriction: dto.genderRestriction !== undefined ? dto.genderRestriction : room.genderRestriction,
          status: dto.status !== undefined ? dto.status : room.status,
        },
        include: {
          roomAmenities: {
            include: { amenity: true },
          },
        },
      });
    });
  }

  async delete(id: string, landlordId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Ownership check
    if (room.property.landlordId !== landlordId) {
      throw new ForbiddenException(
        'Access denied. You do not own the parent property.',
      );
    }

    await this.prisma.room.delete({
      where: { id },
    });

    return { message: 'Room deleted successfully' };
  }

  async findAllByProperty(propertyId: string) {
    return this.prisma.room.findMany({
      where: { propertyId },
      include: {
        roomAmenities: {
          include: { amenity: true },
        },
      },
    });
  }
}
