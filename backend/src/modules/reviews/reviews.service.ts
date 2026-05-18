import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/review.dto';
import { TenancyStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reviewerId: string, dto: CreateReviewDto) {
    const tenancy = await this.prisma.tenancy.findUnique({
      where: { id: dto.tenancyId },
    });

    if (!tenancy) {
      throw new NotFoundException('Hợp đồng thuê phòng không tồn tại.');
    }

    // Rule 1: Tenancy status must be ENDED
    if (tenancy.status !== TenancyStatus.ENDED) {
      throw new BadRequestException(
        'Bạn chỉ có thể đánh giá sau khi hợp đồng thuê phòng đã kết thúc (status: ENDED).',
      );
    }

    // Rule 2: Reviewer must be either the tenant or the landlord
    const isTenant = tenancy.tenantId === reviewerId;
    const isLandlord = tenancy.landlordId === reviewerId;

    if (!isTenant && !isLandlord) {
      throw new ForbiddenException('Bạn không thuộc hợp đồng thuê này để thực hiện đánh giá.');
    }

    const revieweeId = isTenant ? tenancy.landlordId : tenancy.tenantId;

    // Rule 3: Prevent duplicate review from the same reviewer for the same tenancy
    const existingReview = await this.prisma.review.findFirst({
      where: {
        tenancyId: dto.tenancyId,
        reviewerId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('Bạn đã thực hiện đánh giá cho hợp đồng thuê này rồi.');
    }

    return this.prisma.review.create({
      data: {
        tenancyId: dto.tenancyId,
        reviewerId,
        revieweeId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async findForUser(userId: string) {
    return this.prisma.review.findMany({
      where: {
        OR: [{ reviewerId: userId }, { revieweeId: userId }],
      },
      include: {
        tenancy: {
          include: {
            property: true,
            room: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
