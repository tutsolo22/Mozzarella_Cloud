import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { Promotion } from './entities/promotion.entity';
import { Product } from '../products/entities/product.entity';
import { FilesModule } from '../files/files.module';
import { Location } from '../locations/entities/location.entity';
import { PublicPromotionsController } from './public-promotions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion, Product, Location]), FilesModule],
  controllers: [PromotionsController, PublicPromotionsController],
  providers: [PromotionsService],
})
export class PromotionsModule {}