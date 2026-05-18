import {
  Controller,
  Post,
  Get,
  Patch,
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
import { LandlordsService } from './landlords.service';
import { StartOnboardingDto, UpdateLandlordDto } from './dto/onboarding.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Landlords')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('landlords')
export class LandlordsController {
  constructor(private readonly landlordsService: LandlordsService) {}

  @Post('onboarding/start')
  @ApiOperation({ summary: 'Submit landlord onboarding details' })
  @ApiResponse({ status: 201, description: 'Onboarding started' })
  async startOnboarding(
    @GetUser('id') userId: string,
    @Body() dto: StartOnboardingDto,
  ) {
    return this.landlordsService.startOnboarding(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Retrieve your landlord business profile info' })
  async getMe(@GetUser('id') userId: string) {
    return this.landlordsService.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update your landlord business profile info' })
  async updateMe(
    @GetUser('id') userId: string,
    @Body() dto: UpdateLandlordDto,
  ) {
    return this.landlordsService.updateMe(userId, dto);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update your landlord business settings' })
  async updateSettings(
    @GetUser('id') userId: string,
    @Body() dto: UpdateLandlordDto,
  ) {
    return this.landlordsService.updateMe(userId, dto);
  }

  @Post('activate')
  @ApiOperation({
    summary: 'Verify/Activate landlord capability (Self-led or Admin-led)',
  })
  @ApiQuery({
    name: 'targetUserId',
    required: false,
    description: 'ID of user to activate (optional)',
  })
  async activate(
    @GetUser('id') userId: string,
    @Query('targetUserId') targetUserId?: string,
  ) {
    return this.landlordsService.activate(userId, targetUserId);
  }
}
