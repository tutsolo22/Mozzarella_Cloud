import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
export declare class TasksService {
    private readonly orderRepository;
    private readonly logger;
    constructor(orderRepository: Repository<Order>);
    handlePendingPaymentReminders(): Promise<void>;
}
