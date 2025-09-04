import { CustomersService } from '../customers/customers.service';
import { OrdersService } from '../orders/orders.service';
import { CreateWhatsappOrderDto } from './dto/create-whatsapp-order.dto';
import { Tenant } from '../tenants/entities/tenant.entity';
import { PaymentsService } from '../payments/payments.service';
export declare class WhatsappIntegrationService {
    private readonly customersService;
    private readonly ordersService;
    private readonly paymentsService;
    constructor(customersService: CustomersService, ordersService: OrdersService, paymentsService: PaymentsService);
    processIncomingOrder(tenant: Tenant, orderDto: CreateWhatsappOrderDto): Promise<{
        message: string;
        paymentLink: string;
        orderId: string;
        totalAmount?: undefined;
        estimatedReadyAt?: undefined;
    } | {
        message: string;
        orderId: string;
        totalAmount: number;
        estimatedReadyAt: Date;
        paymentLink?: undefined;
    }>;
}
