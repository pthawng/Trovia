import { Module } from '@nestjs/common';
import { RentalRequestsService } from './rental-requests.service';
import {
  RentalRequestsController,
  LandlordsRentalRequestsController,
} from './rental-requests.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RentalRequestsController, LandlordsRentalRequestsController],
  providers: [RentalRequestsService],
  exports: [RentalRequestsService],
})
export class RentalRequestsModule {}
