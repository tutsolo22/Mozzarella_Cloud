import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RoleEnum } from './enums/role.enum';
export declare class RolesService {
    private readonly roleRepository;
    private readonly permissionRepository;
    constructor(roleRepository: Repository<Role>, permissionRepository: Repository<Permission>);
    findOneByName(name: RoleEnum): Promise<Role>;
    findAll(): Promise<Role[]>;
}
