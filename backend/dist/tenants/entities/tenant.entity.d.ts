import { User } from '../../users/entities/user.entity';
import { License } from '../../licenses/entities/license.entity';
import { TenantConfiguration } from '../../tenant-configuration/entities/tenant-configuration.entity';
import { Location } from '../../locations/entities/location.entity';
export declare enum TenantPlan {
    Trial = "trial",
    Basic = "basic",
    Premium = "premium"
}
export declare enum TenantStatus {
    Active = "active",
    Trial = "trial",
    Suspended = "suspended",
    Inactive = "inactive"
}
export declare class Tenant {
    id: string;
    name: string;
    status: TenantStatus;
    plan: TenantPlan;
    whatsappApiKey: string;
    users: User[];
    locations: Location[];
    license: License;
    configuration: TenantConfiguration;
    createdAt: Date;
    updatedAt: Date;
}
