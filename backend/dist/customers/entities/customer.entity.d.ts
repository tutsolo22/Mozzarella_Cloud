import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class Customer {
    id: string;
    tenantId: string;
    tenant: Tenant;
    fullName: string;
    phoneNumber: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    createdAt: Date;
    updatedAt: Date;
}
