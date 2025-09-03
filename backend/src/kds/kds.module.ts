import { Module } from '@nestjs/common';
import { KdsService } from './kds.service';
import { KdsController } from './kds.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [KdsController],
  providers: [KdsService],
})
export class KdsModule {}