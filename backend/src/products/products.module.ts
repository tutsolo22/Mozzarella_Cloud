import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { FilesModule } from '../files/files.module';
import { ProductCategory } from './entities/product-category.entity';
import { RecipeItem } from './entities/recipe-item.entity';
import { ProductCategoriesController } from './product-categories.controller';
import { ProductCategoriesService } from './product-categories.service';
import { CsvModule } from '../csv/csv.module';
import { ProductIngredient } from './entities/product-ingredient.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductCategory,
      RecipeItem,
      ProductIngredient,
      Ingredient,
    ]),
    FilesModule,
    CsvModule,
  ],
  controllers: [ProductsController, ProductCategoriesController],
  providers: [ProductsService, ProductCategoriesService],
  exports: [ProductsService],
})
export class ProductsModule {}