import { Tenant } from '../../tenants/entities/tenant.entity';
export declare enum ExternalService {
    INVOICING = "INVOICING"
}
export declare class ApiKey {
    id: string;
    tenantId: string;
    tenant: Tenant;
    serviceIdentifier: ExternalService;
    key: string;
    createdAt: Date;
    updatedAt: Date;
}
