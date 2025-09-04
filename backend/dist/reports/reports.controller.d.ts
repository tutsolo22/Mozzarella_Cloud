import { ReportsService } from './reports.service';
import { UserPayload } from '../auth/decorators/user.decorator';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getManagerDashboardMetrics(user: UserPayload): Promise<{
        todaySales: number;
        todayOrders: number;
        statusCounts: any;
        weeklySales: {
            date: string;
            sales: number;
        }[];
    }>;
}
