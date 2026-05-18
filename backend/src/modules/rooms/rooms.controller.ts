import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
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
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AppRole } from '@prisma/client';

@ApiTags('Rooms')
@Controller()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('properties/:propertyId/rooms')
  @ApiOperation({ summary: 'List all rooms in a rental property' })
  async findAllByProperty(@Param('propertyId') propertyId: string) {
    return this.roomsService.findAllByProperty(propertyId);
  }

  @Post('properties/:propertyId/rooms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add a new room to a property (Owner Landlord only)',
  })
  async create(
    @Param('propertyId') propertyId: string,
    @GetUser('id') landlordId: string,
    @Body() dto: CreateRoomDto,
  ) {
    return this.roomsService.create(propertyId, landlordId, dto);
  }

  @Patch('rooms/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update room details (Owner Landlord only)' })
  async update(
    @Param('id') id: string,
    @GetUser('id') landlordId: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomsService.update(id, landlordId, dto);
  }

  @Delete('rooms/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a room (Owner Landlord only)' })
  async delete(@Param('id') id: string, @GetUser('id') landlordId: string) {
    return this.roomsService.delete(id, landlordId);
  }
}
