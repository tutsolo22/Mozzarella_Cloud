import { License } from '../../licenses/entities/license.entity';
import { TenantConfiguration } from './tenant-configuration.entity';
import { User } from '../../users/entities/user.entity';
import { Location } from '../../locations/entities/location.entity';
export declare enum TenantStatus {
    Active = "active",
    Suspended = "suspended",
    Trial = "trial"
}
export declare enum TenantPlan {
    Basic = "basic",
    Advanced = "advanced",
    Enterprise = "enterprise"
}
export declare class Tenant {
    id: string;
    name: string;
    status: TenantStatus;
    plan: TenantPlan;
    license: License;
    configuration: TenantConfiguration;
    users: User[];
    locations: Location[];
    whatsappApiKey?: string;
    createdAt: Date;
    updatedAt: Date;
}
