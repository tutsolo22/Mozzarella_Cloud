import { Order } from '../orders/entities/order.entity';
import { Repository } from 'typeorm';
export declare class ReportsService {
    private readonly orderRepository;
    constructor(orderRepository: Repository<Order>);
    getManagerDashboardMetrics(tenantId: string, locationId: string): Promise<{
        todaySales: number;
        todayOrders: number;
        statusCounts: any;
        weeklySales: {
            date: string;
            sales: number;
        }[];
    }>;
}
