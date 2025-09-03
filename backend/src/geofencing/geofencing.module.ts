import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeofencingService } from './geofencing.service';
import { Order } from '../orders/entities/order.entity';
import { TenantConfiguration } from '../tenants/entities/tenant-configuration.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, TenantConfiguration]),
    forwardRef(() => NotificationsModule),
    HttpModule,
  ],
  providers: [GeofencingService],
  exports: [GeofencingService],
})
export class GeofencingModule {}