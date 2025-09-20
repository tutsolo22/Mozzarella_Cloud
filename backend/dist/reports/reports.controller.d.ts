import { ReportsService } from './reports.service';
import { UserPayload } from '../auth/decorators/user.decorator';
import { ProfitAndLossReport } from './interfaces/pnl-report.interface';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboardStats(user: UserPayload): Promise<import("./interfaces/dashboard-stats.interface").DashboardStats>;
    getProfitAndLossReport(user: UserPayload, startDate: string, endDate: string): Promise<ProfitAndLossReport>;
}
