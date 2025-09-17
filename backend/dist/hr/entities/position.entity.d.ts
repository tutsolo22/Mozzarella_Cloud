import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class Position {
    id: string;
    name: string;
    description: string;
    tenantId: string;
    tenant: Tenant;
    createdAt: Date;
    updatedAt: Date;
}
