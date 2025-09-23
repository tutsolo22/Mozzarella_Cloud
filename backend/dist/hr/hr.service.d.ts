import { DataSource, Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { Position } from './entities/position.entity';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AuthService } from '../auth/auth.service';
export declare class HrService {
    private readonly employeeRepository;
    private readonly positionRepository;
    private readonly dataSource;
    private readonly authService;
    private readonly logger;
    constructor(employeeRepository: Repository<Employee>, positionRepository: Repository<Position>, dataSource: DataSource, authService: AuthService);
    createPosition(dto: CreatePositionDto, tenantId: string): Promise<Position>;
    findAllPositions(tenantId: string): Promise<Position[]>;
    updatePosition(id: string, dto: UpdatePositionDto, tenantId: string): Promise<Position>;
    removePosition(id: string, tenantId: string): Promise<void>;
    createEmployee(createEmployeeDto: CreateEmployeeDto, tenantId: string, locationId: string): Promise<Employee>;
    findAllEmployees(tenantId: string, locationId?: string): Promise<Employee[]>;
    updateEmployee(id: string, dto: UpdateEmployeeDto, tenantId: string): Promise<Employee>;
    removeEmployee(id: string, tenantId: string): Promise<void>;
    calculateLaborCost(tenantId: string, startDate: Date, endDate: Date, locationId?: string): Promise<number>;
    calculateLaborCostForLocation(locationId: string, startDate: Date, endDate: Date): Promise<number>;
}
