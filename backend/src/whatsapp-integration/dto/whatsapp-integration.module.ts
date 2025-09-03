import { Module } from '@nestjs/common';
import { WhatsappIntegrationService } from './whatsapp-integration.service';
import { WhatsappIntegrationController } from './whatsapp-integration.controller';
import { TenantsModule } from '../tenants/tenants.module';
import { CustomersModule } from '../customers/customers.module';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TenantsModule, CustomersModule, OrdersModule, ProductsModule],
  providers: [WhatsappIntegrationService],
  controllers: [WhatsappIntegrationController],
})
export class WhatsappIntegrationModule {}