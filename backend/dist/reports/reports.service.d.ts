import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { InventoryMovement } from '../inventory-movements/entities/inventory-movement.entity';
import { Employee } from '../hr/entities/employee.entity';
import { OverheadCost } from '../financials/entities/overhead-cost.entity';
import { ProfitAndLossReport } from './interfaces/pnl-report.interface';
export declare class ReportsService {
    private readonly orderRepository;
    private readonly movementRepository;
    private readonly employeeRepository;
    private readonly overheadCostRepository;
    constructor(orderRepository: Repository<Order>, movementRepository: Repository<InventoryMovement>, employeeRepository: Repository<Employee>, overheadCostRepository: Repository<OverheadCost>);
    getProfitAndLossReport(tenantId: string, locationId: string, startDateStr: string, endDateStr: string): Promise<ProfitAndLossReport>;
}
