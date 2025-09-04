import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { Position } from './entities/position.entity';
export declare class HrService {
    private readonly employeeRepository;
    private readonly positionRepository;
    constructor(employeeRepository: Repository<Employee>, positionRepository: Repository<Position>);
    createPosition(dto: any, tenantId: string): void;
    findAllPositions(tenantId: string): void;
    updatePosition(id: string, dto: any, tenantId: string): void;
    removePosition(id: string, tenantId: string): void;
    createEmployee(dto: any, tenantId: string): void;
    findAllEmployees(tenantId: string, locationId?: string): Promise<Employee[]>;
    updateEmployee(id: string, dto: any, tenantId: string): void;
    calculateLaborCost(tenantId: string, startDate: Date, endDate: Date, locationId?: string): Promise<number>;
    calculateLaborCostForLocation(locationId: string, startDate: Date, endDate: Date): Promise<number>;
}
