import { User } from '../../users/entities/user.entity';
import { TenantStatus } from '../enums/tenant-status.enum';
import { License } from '../../licenses/entities/license.entity';
import { TenantConfiguration } from './tenant-configuration.entity';
import { Location } from '../../locations/entities/location.entity';
export declare class Tenant {
    id: string;
    name: string;
    status: TenantStatus;
    license: License;
    configuration: TenantConfiguration;
    whatsappApiKey: string | null;
    users: User[];
    locations: Location[];
    createdAt: Date;
    updatedAt: Date;
}
