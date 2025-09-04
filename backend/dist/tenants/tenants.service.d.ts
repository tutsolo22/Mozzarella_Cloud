import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UsersService } from '../users/users.service';
import { LicensingService } from '../licenses/licensing.service';
import { TenantConfiguration } from './entities/tenant-configuration.entity';
import { Role } from '../roles/entities/role.entity';
export declare class TenantsService {
    private readonly tenantRepository;
    private readonly roleRepository;
    private readonly usersService;
    private readonly licensingService;
    constructor(tenantRepository: Repository<Tenant>, roleRepository: Repository<Role>, usersService: UsersService, licensingService: LicensingService);
    create(createTenantDto: CreateTenantDto): Promise<Tenant>;
    findOne(id: string): Promise<Tenant>;
    getConfiguration(tenantId: string): Promise<TenantConfiguration>;
    updateConfiguration(tenantId: string, updateDto: Partial<TenantConfiguration>): Promise<TenantConfiguration>;
    findByApiKey(apiKey: string): Promise<Tenant | null>;
    regenerateWhatsappApiKey(tenantId: string): Promise<string>;
}
