import { HrService } from './hr.service';
import { UserPayload } from '../auth/decorators/user.decorator';
export declare class HrController {
    private readonly hrService;
    constructor(hrService: HrService);
    createPosition(createPositionDto: any, user: UserPayload): void;
    findAllPositions(user: UserPayload): void;
    updatePosition(id: string, updatePositionDto: any, user: UserPayload): void;
    removePosition(id: string, user: UserPayload): void;
    createEmployee(createEmployeeDto: any, user: UserPayload): void;
    findAllEmployees(user: UserPayload): Promise<import("./entities/employee.entity").Employee[]>;
    updateEmployee(id: string, updateEmployeeDto: any, user: UserPayload): void;
}
