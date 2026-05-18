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
import { ContractsService } from './contracts.service';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AppRole } from '@prisma/client';

@ApiTags('Contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(AppRole.LANDLORD)
  @ApiOperation({ summary: 'Create a draft rental contract (Landlord only)' })
  @ApiResponse({ status: 201, description: 'Contract draft created' })
  async create(
    @GetUser('id') landlordId: string,
    @Body() dto: CreateContractDto,
  ) {
    return this.contractsService.create(landlordId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contracts for authenticated user' })
  @ApiResponse({ status: 200, description: 'List of contracts' })
  async findAll(@GetUser('id') userId: string) {
    return this.contractsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract details by ID' })
  @ApiResponse({ status: 200, description: 'Contract details' })
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.contractsService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(AppRole.LANDLORD)
  @ApiOperation({ summary: 'Update a draft contract (Landlord only)' })
  @ApiResponse({ status: 200, description: 'Contract updated' })
  async update(
    @Param('id') id: string,
    @GetUser('id') landlordId: string,
    @Body() dto: UpdateContractDto,
  ) {
    return this.contractsService.update(id, landlordId, dto);
  }

  @Post(':id/send')
  @UseGuards(RolesGuard)
  @Roles(AppRole.LANDLORD)
  @ApiOperation({ summary: 'Send a draft contract to tenant (Landlord only)' })
  @ApiResponse({ status: 200, description: 'Contract sent to tenant' })
  async send(@Param('id') id: string, @GetUser('id') landlordId: string) {
    return this.contractsService.sendContract(id, landlordId);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Sign/Accept an assigned contract (Tenant only)' })
  @ApiResponse({ status: 200, description: 'Contract signed' })
  async accept(@Param('id') id: string, @GetUser('id') tenantId: string) {
    return this.contractsService.acceptContract(id, tenantId);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject an assigned contract (Tenant only)' })
  @ApiResponse({ status: 200, description: 'Contract rejected' })
  async reject(@Param('id') id: string, @GetUser('id') tenantId: string) {
    return this.contractsService.rejectContract(id, tenantId);
  }
}
