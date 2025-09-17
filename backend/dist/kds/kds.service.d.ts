import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
export declare class KdsService {
    private readonly orderRepository;
    constructor(orderRepository: Repository<Order>);
    findOrders(tenantId: string, locationId: string, zoneId?: string): Promise<Order[]>;
}
