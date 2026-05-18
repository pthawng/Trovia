import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SavedPropertiesService } from './saved-properties.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Saved Properties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('saved-properties')
export class SavedPropertiesController {
  constructor(
    private readonly savedPropertiesService: SavedPropertiesService,
  ) {}

  @Get('count')
  @ApiOperation({ summary: 'Get the number of saved property listings' })
  async count(@GetUser('id') tenantId: string) {
    return this.savedPropertiesService.count(tenantId);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get property recommendations based on saved behavior' })
  async getRecommendations(@GetUser('id') tenantId: string) {
    return this.savedPropertiesService.getRecommendations(tenantId);
  }

  @Post(':propertyId')
  @ApiOperation({ summary: 'Save a rental property listing to your favorites' })
  @ApiResponse({ status: 201, description: 'Property saved successfully' })
  async save(
    @GetUser('id') tenantId: string,
    @Param('propertyId') propertyId: string,
  ) {
    return this.savedPropertiesService.save(tenantId, propertyId);
  }

  @Delete(':propertyId')
  @ApiOperation({ summary: 'Remove a property listing from your favorites' })
  async unsave(
    @GetUser('id') tenantId: string,
    @Param('propertyId') propertyId: string,
  ) {
    return this.savedPropertiesService.unsave(tenantId, propertyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all saved property listings' })
  async getSavedListings(@GetUser('id') tenantId: string) {
    return this.savedPropertiesService.getSavedListings(tenantId);
  }
}
