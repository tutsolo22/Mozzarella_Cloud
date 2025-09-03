import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { FilesModule } from '../files/files.module';
import { ProductCategory } from './entities/product-category.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { RecipeItem } from './entities/recipe-item.entity';
import { FilesService } from '../files/files.service';
import { ProductCategoriesController } from './product-categories.controller';
import { ProductCategoriesService } from './product-categories.service';
import { CsvModule } from '../csv/csv.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductCategory, RecipeItem, OrderItem]),
    FilesModule,
    CsvModule,
  ],
  controllers: [ProductsController, ProductCategoriesController],
  providers: [ProductsService, ProductCategoriesService, FilesService],
  exports: [ProductsService],
})
export class ProductsModule {}