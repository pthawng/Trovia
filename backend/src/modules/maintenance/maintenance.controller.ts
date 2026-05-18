import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import {
  CreateMaintenanceDto,
  UpdateMaintenanceStatusDto,
  UpdateMaintenanceDto,
} from './dto/maintenance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AppRole } from '@prisma/client';

@ApiTags('Maintenance')
@Controller()
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post('maintenance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.TENANT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a maintenance request (Tenants only)' })
  async create(
    @GetUser('id') tenantId: string,
    @Body() dto: CreateMaintenanceDto,
  ) {
    return this.maintenanceService.create(tenantId, dto);
  }

  @Get('landlords/maintenance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get all maintenance requests for a landlord's properties",
  })
  async findForLandlord(@GetUser('id') landlordId: string) {
    return this.maintenanceService.findForLandlord(landlordId);
  }

  @Get('maintenance/tenant')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.TENANT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all maintenance requests submitted by the current tenant',
  })
  async findForTenant(@GetUser('id') tenantId: string) {
    return this.maintenanceService.findForTenant(tenantId);
  }

  @Patch('maintenance/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Update status of a maintenance request (Landlord owner or Tenant requester only)',
  })
  async updateStatus(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateMaintenanceStatusDto,
  ) {
    return this.maintenanceService.updateStatus(id, userId, dto.status);
  }

  @Patch('maintenance/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Update maintenance details including assignee, comments, and status (Landlord owner or Tenant requester only)',
  })
  async update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateMaintenanceDto,
  ) {
    return this.maintenanceService.update(id, userId, dto);
  }
}
