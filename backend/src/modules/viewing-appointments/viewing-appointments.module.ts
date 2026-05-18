import { Module } from '@nestjs/common';
import { ViewingAppointmentsService } from './viewing-appointments.service';
import { ViewingAppointmentsController } from './viewing-appointments.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ViewingAppointmentsController],
  providers: [ViewingAppointmentsService],
  exports: [ViewingAppointmentsService],
})
export class ViewingAppointmentsModule {}
