import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Order } from '../orders/entities/order.entity';
import { InventoryMovement } from '../inventory-movements/entities/inventory-movement.entity';
import { Employee } from '../hr/entities/employee.entity';
import { OverheadCost } from '../financials/entities/overhead-cost.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      InventoryMovement,
      Employee,
      OverheadCost,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}