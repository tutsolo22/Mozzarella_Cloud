import { Tenant } from '../../tenants/entities/tenant.entity';
export declare enum ApiKeyServiceIdentifier {
    INVOICING = "INVOICING"
}
export declare class ApiKey {
    id: string;
    tenantId: string;
    tenant: Tenant;
    name: string;
    serviceIdentifier: ApiKeyServiceIdentifier;
    apiUrl: string;
    key: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
