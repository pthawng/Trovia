import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RentalRequestsService } from './rental-requests.service';
import {
  CreateRentalRequestDto,
  UpdateRentalRequestStatusDto,
} from './dto/rental-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AppRole } from '@prisma/client';

@ApiTags('Rental Requests (Tenant Actions)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rental-requests')
export class RentalRequestsController {
  constructor(private readonly rentalRequestsService: RentalRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a rental request for a property/room' })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  async create(
    @GetUser('id') tenantId: string,
    @Body() dto: CreateRentalRequestDto,
  ) {
    return this.rentalRequestsService.create(tenantId, dto);
  }

  @Get('me')
  @ApiOperation({
    summary: 'List all rental requests you have submitted as tenant',
  })
  async findAllForTenant(@GetUser('id') tenantId: string) {
    return this.rentalRequestsService.findAllForTenant(tenantId);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update status of rental request (Accept/Reject/Cancel)',
  })
  async updateStatus(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateRentalRequestStatusDto,
  ) {
    return this.rentalRequestsService.updateStatus(id, userId, dto);
  }
}

@ApiTags('Rental Requests (Landlord Actions)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.LANDLORD)
@Controller('landlords/rental-requests')
export class LandlordsRentalRequestsController {
  constructor(private readonly rentalRequestsService: RentalRequestsService) {}

  @Get()
  @ApiOperation({
    summary:
      'List all rental requests submitted by tenants for your properties',
  })
  async findAllForLandlord(@GetUser('id') landlordId: string) {
    return this.rentalRequestsService.findAllForLandlord(landlordId);
  }
}
