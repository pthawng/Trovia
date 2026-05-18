import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a review for landlord/tenant after tenancy ended' })
  async create(@GetUser('id') reviewerId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(reviewerId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get all reviews written by or received by current user' })
  async findMyReviews(@GetUser('id') userId: string) {
    return this.reviewsService.findForUser(userId);
  }
}
