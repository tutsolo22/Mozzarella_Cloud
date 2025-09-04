import { OrdersService } from '../orders/orders.service';
import { Order } from '../orders/entities/order.entity';
export declare class KdsService {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    getActiveOrdersForZone(tenantId: string, locationId: string, zoneId: string): Promise<Order[]>;
}
