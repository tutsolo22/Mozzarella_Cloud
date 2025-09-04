import { Repository } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
export declare class SeedingService {
    private readonly userRepository;
    private readonly roleRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>);
    seed(): Promise<void>;
    private seedRoles;
    private seedSuperAdmin;
}
