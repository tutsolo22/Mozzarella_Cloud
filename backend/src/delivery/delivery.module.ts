import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DeliveryController } from './delivery.controller';
import { RouteOptimizationService } from './services/route-optimization.service';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    UsersModule,
    OrdersModule,
    TenantsModule, // Para acceder a la configuración del tenant (API Keys)
    HttpModule, // Para hacer llamadas a APIs externas
  ],
  controllers: [DeliveryController],
  providers: [RouteOptimizationService],
})
export class DeliveryModule {}