import { Tenant } from '../../tenants/entities/tenant.entity';
import { LicenseStatus } from '../enums/license-status.enum';
export declare class License {
    id: string;
    key: string;
    tenant: Tenant;
    tenantId: string;
    userLimit: number;
    branchLimit: number;
    expiresAt: Date;
    status: LicenseStatus;
    createdAt: Date;
    updatedAt: Date;
}
