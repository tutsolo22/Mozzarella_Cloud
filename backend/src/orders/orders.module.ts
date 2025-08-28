import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { InventoryMovementsModule } from '../inventory-movements/inventory-movements.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { Product } from '../products/entities/product.entity';
import { ProductIngredient } from '../products/entities/product-ingredient.entity';
import { ProductCategory } from '../products/entities/product-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      ProductIngredient,
    ]),
    InventoryMovementsModule,
    NotificationsModule,
    IngredientsModule, // To get access to IngredientRepository
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}