import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { InventoryMovementsModule } from '../inventory-movements/inventory-movements.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { Product } from '../products/entities/product.entity';
import { TenantConfiguration } from '../tenant-configuration/entities/tenant-configuration.entity';
import { GeocodingModule } from '../geocoding/geocoding.module';
import { PaymentsModule } from '../payments/payments.module';
import { User } from '../users/entities/user.entity';
import { Location } from '../locations/entities/location.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      TenantConfiguration,
      User,
      Location,
      Ingredient, // <-- Esta es la corrección
    ]),
    InventoryMovementsModule,
    NotificationsModule,
    IngredientsModule,
    forwardRef(() => PaymentsModule),
    GeocodingModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}