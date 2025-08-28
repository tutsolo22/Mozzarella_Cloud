import { User } from '../../users/entities/user.entity';
import { TenantStatus } from '../enums/tenant-status.enum';
import { License } from '../../licenses/entities/license.entity';
export declare class Tenant {
    id: string;
    name: string;
    status: TenantStatus;
    license: License;
    users: User[];
    createdAt: Date;
    updatedAt: Date;
}
