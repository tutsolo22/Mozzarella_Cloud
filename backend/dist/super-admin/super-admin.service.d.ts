import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantStatus } from '../tenants/enums/tenant-status.enum';
import { LicensingService } from '../licenses/licensing.service';
import { CreateLicenseDto } from './dto/create-license.dto';
export declare class SuperAdminService {
    private readonly tenantRepository;
    private readonly licensingService;
    constructor(tenantRepository: Repository<Tenant>, licensingService: LicensingService);
    findAllTenants(): Promise<Tenant[]>;
    updateTenantStatus(id: string, status: TenantStatus): Promise<Tenant>;
    createLicenseForTenant(tenantId: string, createLicenseDto: CreateLicenseDto): Promise<import("../licenses/entities/license.entity").License>;
}
