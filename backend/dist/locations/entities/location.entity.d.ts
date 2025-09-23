import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class Location {
    id: string;
    name: string;
    address: string;
    phone?: string;
    whatsappNumber?: string;
    isActive: boolean;
    tenantId: string;
    tenant: Tenant;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
