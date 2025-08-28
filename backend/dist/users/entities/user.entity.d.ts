import { Role } from '../../roles/entities/role.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
export declare enum UserStatus {
    PendingVerification = "pending_verification",
    Active = "active",
    Suspended = "suspended"
}
export declare class User {
    id: string;
    email: string;
    password?: string;
    fullName: string;
    status: UserStatus;
    verificationToken?: string;
    role: Role;
    roleId: string;
    tenant: Tenant;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
}
