import { Tenant } from './tenant.entity';
export declare class TenantConfiguration {
    id: string;
    tenantId: string;
    tenant: Tenant;
    businessName: string;
    legalName?: string;
    rfc?: string;
    taxRegime?: string;
    taxAddress?: string;
    contactEmail: string;
    contactPhone?: string;
    businessPhone?: string;
    businessWhatsapp?: string;
    branchesHaveSeparatePhones: boolean;
    branchesHaveSeparateWhatsapps: boolean;
    isHexaFactIntegrationEnabled: boolean;
    logoUrl?: string;
    logoDarkUrl?: string;
    faviconUrl?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
}
