import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { InventoryMovementsModule } from '../inventory-movements/inventory-movements.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient]), InventoryMovementsModule],
  controllers: [IngredientsController],
  providers: [IngredientsService],
})
export class IngredientsModule {}