import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { LandlordsModule } from './modules/landlords/landlords.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { ListingsModule } from './modules/listings/listings.module';
import { SavedPropertiesModule } from './modules/saved-properties/saved-properties.module';
import { HealthModule } from './modules/health/health.module';

// New Product Modules for Rental Lifecycle
import { RentalRequestsModule } from './modules/rental-requests/rental-requests.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { ViewingAppointmentsModule } from './modules/viewing-appointments/viewing-appointments.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TenanciesModule } from './modules/tenancies/tenancies.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [
    // Core Infrastructure
    ConfigModule,
    PrismaModule,
    ScheduleModule.forRoot(),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Product Modules
    AuthModule,
    UsersModule,
    RolesModule,
    LandlordsModule,
    PropertiesModule,
    RoomsModule,
    ListingsModule,
    SavedPropertiesModule,
    HealthModule,

    // New Lifecycle Modules
    RentalRequestsModule,
    ConversationsModule,
    ViewingAppointmentsModule,
    ContractsModule,
    PaymentsModule,
    TenanciesModule,
    NotificationsModule,
    MaintenanceModule,
    ReviewsModule,
  ],
})
export class AppModule {}
