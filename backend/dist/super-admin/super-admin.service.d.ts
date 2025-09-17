import { DataSource, Repository } from 'typeorm';
import { Tenant, TenantStatus } from '../tenants/entities/tenant.entity';
import { CreateTenantDto } from '../tenants/dto/create-tenant.dto';
import { UpdateTenantDto } from '../tenants/dto/update-tenant.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../roles/entities/role.entity';
import { License } from '../licenses/entities/license.entity';
import { LicensingService } from '../licenses/licensing.service';
import { GenerateLicenseDto } from '../licenses/dto/generate-license.dto';
import { AuthService } from '../auth/auth.service';
export declare class SuperAdminService {
    private readonly tenantRepository;
    private readonly roleRepository;
    private readonly usersService;
    private readonly licensesService;
    private readonly authService;
    private readonly dataSource;
    private readonly logger;
    constructor(tenantRepository: Repository<Tenant>, roleRepository: Repository<Role>, usersService: UsersService, licensesService: LicensingService, authService: AuthService, dataSource: DataSource);
    findAllTenants(): Promise<Tenant[]>;
    create(createTenantDto: CreateTenantDto): Promise<Tenant>;
    updateTenant(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant>;
    updateTenantStatus(id: string, status: TenantStatus): Promise<Tenant>;
    resendInvitation(userId: string): Promise<{
        message: string;
    }>;
    deleteTenant(tenantId: string): Promise<void>;
    generateTenantLicense(tenantId: string, generateLicenseDto: GenerateLicenseDto): Promise<License>;
    revokeTenantLicense(tenantId: string): Promise<{
        message: string;
    }>;
}
