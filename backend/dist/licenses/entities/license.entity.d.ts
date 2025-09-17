import { Tenant } from '../../tenants/entities/tenant.entity';
export declare enum LicenseStatus {
    Active = "active",
    Expired = "expired",
    Revoked = "revoked"
}
export declare class License {
    id: string;
    key: string;
    tenant: Tenant;
    userLimit: number;
    branchLimit: number;
    expiresAt: Date;
    status: LicenseStatus;
    createdAt: Date;
    updatedAt: Date;
}
