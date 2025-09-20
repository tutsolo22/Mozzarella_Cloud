import { SuperAdminService } from './super-admin.service';
import { CreateTenantDto } from '../tenants/dto/create-tenant.dto';
import { UpdateTenantDto } from '../tenants/dto/update-tenant.dto';
import { TenantStatus } from '../tenants/entities/tenant.entity';
export declare class SuperAdminController {
    private readonly superAdminService;
    constructor(superAdminService: SuperAdminService);
    create(createTenantDto: CreateTenantDto): Promise<import("../tenants/entities/tenant.entity").Tenant>;
    findAll(): Promise<import("../tenants/entities/tenant.entity").Tenant[]>;
    update(id: string, updateTenantDto: UpdateTenantDto): Promise<import("../tenants/entities/tenant.entity").Tenant>;
    updateStatus(id: string, status: TenantStatus): Promise<import("../tenants/entities/tenant.entity").Tenant>;
    resendInvitation(id: string): Promise<{
        message: string;
    }>;
    createDefaultLocationForTenant(tenantId: string): Promise<import("../locations/entities/location.entity").Location>;
    remove(id: string): Promise<void>;
}
