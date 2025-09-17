import { HrService } from './hr.service';
import { UserPayload } from '../auth/decorators/user.decorator';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
export declare class HrController {
    private readonly hrService;
    constructor(hrService: HrService);
    createPosition(createPositionDto: CreatePositionDto, user: UserPayload): Promise<import("./entities/position.entity").Position>;
    findAllPositions(user: UserPayload): Promise<import("./entities/position.entity").Position[]>;
    updatePosition(id: string, updatePositionDto: UpdatePositionDto, user: UserPayload): Promise<import("./entities/position.entity").Position>;
    removePosition(id: string, user: UserPayload): Promise<void>;
    createEmployee(createEmployeeDto: CreateEmployeeDto, user: UserPayload): Promise<import("./entities/employee.entity").Employee>;
    findAllEmployees(user: UserPayload): Promise<import("./entities/employee.entity").Employee[]>;
    updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto, user: UserPayload): Promise<import("./entities/employee.entity").Employee>;
    removeEmployee(id: string, user: UserPayload): Promise<void>;
}
