import { Role } from '../../roles/entities/role.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Location } from '../../locations/entities/location.entity';
export declare enum UserStatus {
    PendingVerification = "pending_verification",
    Active = "active",
    Suspended = "suspended"
}
export declare class User {
    id: string;
    email: string;
    password?: string;
    passwordResetToken?: string | null;
    passwordResetExpires?: Date | null;
    accountSetupToken?: string | null;
    accountSetupTokenExpires?: Date | null;
    fullName: string;
    status: UserStatus;
    verificationToken?: string;
    role: Role;
    roleId: string;
    tenant: Tenant;
    tenantId: string;
    locationId?: string;
    location?: Location;
    maxWeightCapacityKg?: number;
    maxVolumeCapacityM3?: number;
    createdAt: Date;
    updatedAt: Date;
}
