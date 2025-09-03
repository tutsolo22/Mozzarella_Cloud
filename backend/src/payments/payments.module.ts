import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TenantsModule } from '../tenants/tenants.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [TenantsModule, forwardRef(() => OrdersModule)],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}