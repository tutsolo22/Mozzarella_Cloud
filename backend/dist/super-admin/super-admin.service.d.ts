import { Tenant } from '../tenants/entities/tenant.entity';
import { Repository } from 'typeorm';
export declare class SuperAdminService {
    private readonly tenantRepository;
    constructor(tenantRepository: Repository<Tenant>);
    findAllTenants(): Promise<{
        id: string;
        name: string;
    }[]>;
}
