import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PropertyType, PropertyStatus } from '@prisma/client';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async searchListings(query: {
    city?: string;
    district?: string;
    ward?: string;
    type?: PropertyType;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      status: PropertyStatus.PUBLISHED,
      deletedAt: null,
    };

    if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
    if (query.district)
      where.district = { contains: query.district, mode: 'insensitive' };
    if (query.ward) where.ward = { contains: query.ward, mode: 'insensitive' };
    if (query.type) where.type = query.type;

    // Filter based on Room price range if provided
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.rooms = {
        some: {
          isAvailable: true,
          price: {
            gte:
              query.minPrice !== undefined ? Number(query.minPrice) : undefined,
            lte:
              query.maxPrice !== undefined ? Number(query.maxPrice) : undefined,
          },
        },
      };
    }

    // Filter based on selected Amenities (each property must contain all queried amenities)
    if (query.amenities && query.amenities.length > 0) {
      const amenityIds = Array.isArray(query.amenities)
        ? query.amenities
        : [query.amenities];
      where.propertyAmenities = {
        some: {
          amenityId: { in: amenityIds },
        },
      };
    }

    // Set sorting parameters
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Execute queries in transaction to get data and total count
    const [listings, totalCount] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        include: {
          images: { orderBy: { order: 'asc' } },
          rooms: { where: { isAvailable: true } },
          propertyAmenities: {
            include: { amenity: true },
          },
          landlord: {
            include: {
              user: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      listings,
      meta: {
        totalItems: totalCount,
        itemCount: listings.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
    };
  }
}
