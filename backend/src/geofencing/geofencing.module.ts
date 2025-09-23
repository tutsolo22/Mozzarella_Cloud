import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { GeofencingService } from './geofencing.service';
import { Order } from '../orders/entities/order.entity';
import { TenantConfiguration } from '../tenant-configuration/entities/tenant-configuration.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, TenantConfiguration]),
    HttpModule,
    forwardRef(() => NotificationsModule),
  ],
  providers: [GeofencingService],
  exports: [GeofencingService],
})
export class GeofencingModule {}