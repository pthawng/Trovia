import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AppRole, PropertyStatus } from '@prisma/client';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new rental property listing (Landlords only)',
  })
  async create(
    @GetUser('id') landlordId: string,
    @Body() dto: CreatePropertyDto,
  ) {
    return this.propertiesService.create(landlordId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List public published properties or landlord-owned listings',
  })
  @ApiQuery({
    name: 'landlordId',
    required: false,
    description: 'Filter by landlord owner',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PropertyStatus,
    description: 'Filter by listing status',
  })
  async findAll(
    @Query('landlordId') landlordId?: string,
    @Query('status') status?: PropertyStatus,
  ) {
    return this.propertiesService.findAll({
      landlordId,
      status: status || PropertyStatus.PUBLISHED, // default to published
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all properties owned by the current landlord (including drafts)',
  })
  async findMyProperties(@GetUser('id') landlordId: string) {
    return this.propertiesService.findAll({ landlordId });
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Get a specific property detailed info (includes rooms & landlord info)',
  })
  async findOne(@Param('id') id: string, @Query('userId') userId?: string) {
    // Note: If calling from authenticated FE, pass the user ID if available to access DRAFT listings
    return this.propertiesService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update listing details (Owner Landlord only)' })
  async update(
    @Param('id') id: string,
    @GetUser('id') landlordId: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, landlordId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft delete property listing (Owner Landlord only)',
  })
  async delete(@Param('id') id: string, @GetUser('id') landlordId: string) {
    return this.propertiesService.delete(id, landlordId);
  }
}
