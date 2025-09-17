import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { KdsController } from './kds.controller';
import { KdsService } from './kds.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [KdsController],
  providers: [KdsService],
})
export class KdsModule {}