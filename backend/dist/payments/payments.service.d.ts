import { TenantsService } from '../tenants/tenants.service';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';
import { Tenant } from '../tenants/entities/tenant.entity';
export declare class PaymentsService {
    private readonly tenantsService;
    private readonly ordersService;
    private readonly logger;
    constructor(tenantsService: TenantsService, ordersService: OrdersService);
    createMercadoPagoPreference(tenant: Tenant, order: Order): Promise<{
        preferenceId: string;
        init_point: string;
    }>;
    handleWebhook(paymentId: string, tenantId: string): Promise<void>;
}
