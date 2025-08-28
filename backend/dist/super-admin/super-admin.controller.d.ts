import { SuperAdminService } from './super-admin.service';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';
import { CreateLicenseDto } from './dto/create-license.dto';
export declare class SuperAdminController {
    private readonly superAdminService;
    constructor(superAdminService: SuperAdminService);
    findAllTenants(): Promise<import("../tenants/entities/tenant.entity").Tenant[]>;
    updateTenantStatus(id: string, updateTenantStatusDto: UpdateTenantStatusDto): Promise<import("../tenants/entities/tenant.entity").Tenant>;
    createLicense(id: string, createLicenseDto: CreateLicenseDto): Promise<import("../licenses/entities/license.entity").License>;
}
