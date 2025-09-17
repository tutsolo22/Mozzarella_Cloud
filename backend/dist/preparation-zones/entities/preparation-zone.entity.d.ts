import { Tenant } from '../../tenants/entities/tenant.entity';
import { Location } from '../../locations/entities/location.entity';
export declare class PreparationZone {
    id: string;
    name: string;
    tenantId: string;
    tenant: Tenant;
    locationId: string;
    location: Location;
    createdAt: Date;
    updatedAt: Date;
}
