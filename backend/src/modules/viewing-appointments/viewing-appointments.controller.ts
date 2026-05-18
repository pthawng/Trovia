import {
  Controller,
  Post,
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
import { ViewingAppointmentsService } from './viewing-appointments.service';
import {
  CreateViewingAppointmentDto,
  UpdateViewingStatusDto,
} from './dto/viewing-appointment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AppRole } from '@prisma/client';

@ApiTags('Viewing Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ViewingAppointmentsController {
  constructor(
    private readonly viewingAppointmentsService: ViewingAppointmentsService,
  ) {}

  @Post('conversations/:id/viewing-appointments')
  @UseGuards(RolesGuard)
  @Roles(AppRole.LANDLORD)
  @ApiOperation({
    summary:
      'Create a viewing appointment inside a conversation (Landlord only)',
  })
  @ApiResponse({ status: 201, description: 'Appointment created' })
  async create(
    @Param('id') conversationId: string,
    @GetUser('id') landlordId: string,
    @Body() dto: CreateViewingAppointmentDto,
  ) {
    return this.viewingAppointmentsService.create(
      conversationId,
      landlordId,
      dto,
    );
  }

  @Patch('viewing-appointments/:id/status')
  @ApiOperation({ summary: 'Update appointment status (Confirm/Decline)' })
  @ApiResponse({ status: 200, description: 'Appointment status updated' })
  async updateStatus(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateViewingStatusDto,
  ) {
    return this.viewingAppointmentsService.updateStatus(id, userId, dto);
  }
}
