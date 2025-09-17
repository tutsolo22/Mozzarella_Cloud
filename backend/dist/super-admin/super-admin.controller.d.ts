import { SuperAdminService } from './super-admin.service';
import { CreateTenantDto } from '../tenants/dto/create-tenant.dto';
import { GenerateLicenseDto } from '../licenses/dto/generate-license.dto';
import { UpdateTenantDto } from '../tenants/dto/update-tenant.dto';
import { UpdateTenantStatusDto } from '../tenants/dto/update-tenant-status.dto';
export declare class SuperAdminController {
    private readonly superAdminService;
    constructor(superAdminService: SuperAdminService);
    findAll(): Promise<import("../tenants/entities/tenant.entity").Tenant[]>;
    create(createTenantDto: CreateTenantDto): Promise<import("../tenants/entities/tenant.entity").Tenant>;
    resendInvitation(userId: string): Promise<{
        message: string;
    }>;
    update(id: string, updateTenantDto: UpdateTenantDto): Promise<import("../tenants/entities/tenant.entity").Tenant>;
    updateStatus(id: string, updateTenantStatusDto: UpdateTenantStatusDto): Promise<import("../tenants/entities/tenant.entity").Tenant>;
    deleteTenant(id: string): Promise<void>;
    generateLicense(tenantId: string, generateLicenseDto: GenerateLicenseDto): Promise<import("../licenses/entities/license.entity").License>;
    revokeLicense(tenantId: string): Promise<{
        message: string;
    }>;
}
