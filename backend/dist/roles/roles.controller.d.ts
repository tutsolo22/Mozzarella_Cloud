import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    findAll(): Promise<Role[]>;
}
