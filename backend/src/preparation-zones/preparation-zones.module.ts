import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreparationZone } from './entities/preparation-zone.entity';
import { PreparationZonesService } from './preparation-zones.service';
import { PreparationZonesController } from './preparation-zones.controller';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PreparationZone, Product])],
  controllers: [PreparationZonesController],
  providers: [PreparationZonesService],
})
export class PreparationZonesModule {}