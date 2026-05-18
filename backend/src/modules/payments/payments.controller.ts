import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AppRole } from '@prisma/client';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('payments')
  @ApiOperation({ summary: 'Get all payments for authenticated user' })
  @ApiResponse({ status: 200, description: 'List of payments' })
  async findAll(@GetUser('id') userId: string) {
    return this.paymentsService.findAll(userId);
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Get payment details by ID' })
  @ApiResponse({ status: 200, description: 'Payment details' })
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.paymentsService.findOne(id, userId);
  }

  @Post('contracts/:id/payments')
  @UseGuards(RolesGuard)
  @Roles(AppRole.LANDLORD)
  @ApiOperation({
    summary: 'Create/Bill a new payment for a contract (Landlord only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment invoice billed successfully',
  })
  async create(
    @Param('id') contractId: string,
    @GetUser('id') landlordId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPaymentForContract(
      contractId,
      landlordId,
      dto,
    );
  }

  @Post('payments/:id/mark-paid')
  @ApiOperation({
    summary: 'Mark a pending payment as paid (Manual simulation)',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment successfully processed & marked paid',
  })
  async markPaid(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.paymentsService.markPaid(id, userId);
  }
}
