import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { InventoryMovementsModule } from '../inventory-movements/inventory-movements.module';
import { InventoryMovement } from '../inventory-movements/entities/inventory-movement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ingredient, InventoryMovement]),
    InventoryMovementsModule,
  ],
  controllers: [IngredientsController],
  providers: [IngredientsService],
  exports: [IngredientsService],
})
export class IngredientsModule {}