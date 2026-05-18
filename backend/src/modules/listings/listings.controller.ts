import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { PropertyType } from '@prisma/client';

@ApiTags('Listings (Public Exploration)')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Public property discovery endpoint (filters, search, pagination)',
  })
  @ApiQuery({ name: 'city', required: false, example: 'Hồ Chí Minh' })
  @ApiQuery({ name: 'district', required: false, example: 'Bình Thạnh' })
  @ApiQuery({ name: 'ward', required: false })
  @ApiQuery({ name: 'type', enum: PropertyType, required: false })
  @ApiQuery({
    name: 'minPrice',
    type: Number,
    required: false,
    example: 3000000,
  })
  @ApiQuery({
    name: 'maxPrice',
    type: Number,
    required: false,
    example: 10000000,
  })
  @ApiQuery({
    name: 'amenities',
    type: String,
    isArray: true,
    required: false,
    description: 'Amenity UUIDs',
  })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiQuery({
    name: 'sortBy',
    type: String,
    required: false,
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    enum: ['asc', 'desc'],
    required: false,
    example: 'desc',
  })
  async searchListings(
    @Query('city') city?: string,
    @Query('district') district?: string,
    @Query('ward') ward?: string,
    @Query('type') type?: PropertyType,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('amenities') amenities?: string[],
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.listingsService.searchListings({
      city,
      district,
      ward,
      type,
      minPrice,
      maxPrice,
      amenities,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }
}
