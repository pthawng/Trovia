import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TenanciesService } from './tenancies.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AppRole } from '@prisma/client';

@ApiTags('Tenancies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TenanciesController {
  constructor(private readonly tenanciesService: TenanciesService) {}

  @Get('tenancies/me')
  @ApiOperation({ summary: 'Get active tenancies for authenticated tenant' })
  @ApiResponse({ status: 200, description: 'List of active tenancies' })
  async findMyTenancies(@GetUser('id') tenantId: string) {
    return this.tenanciesService.findAllForTenant(tenantId);
  }

  @Get('landlords/tenancies')
  @UseGuards(RolesGuard)
  @Roles(AppRole.LANDLORD)
  @ApiOperation({ summary: 'Get active tenancies on landlord properties' })
  @ApiResponse({
    status: 200,
    description: 'List of active landlord tenancies',
  })
  async findLandlordTenancies(@GetUser('id') landlordId: string) {
    return this.tenanciesService.findAllForLandlord(landlordId);
  }

  @Get('tenancies/:id')
  @ApiOperation({ summary: 'Get single tenancy details' })
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.tenanciesService.findOne(id, userId);
  }

  @Post('tenancies/:id/request-move-out')
  @UseGuards(RolesGuard)
  @Roles(AppRole.TENANT)
  @ApiOperation({ summary: 'Tenant requests to move out' })
  async requestMoveOut(@Param('id') id: string, @GetUser('id') tenantId: string) {
    return this.tenanciesService.requestMoveOut(id, tenantId);
  }

  @Post('tenancies/:id/approve-move-out')
  @UseGuards(RolesGuard)
  @Roles(AppRole.LANDLORD)
  @ApiOperation({ summary: 'Landlord approves tenant move out request' })
  async approveMoveOut(@Param('id') id: string, @GetUser('id') landlordId: string) {
    return this.tenanciesService.approveMoveOut(id, landlordId);
  }
}
