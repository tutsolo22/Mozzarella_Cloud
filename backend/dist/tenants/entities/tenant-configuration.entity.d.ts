import { Tenant } from './tenant.entity';
export declare class TenantConfiguration {
    id: string;
    tenantId: string;
    tenant: Tenant;
    slogan?: string;
    contactPhone?: string;
    fiscalAddress?: string;
    logoUrl?: string;
    logoDarkUrl?: string;
    faviconUrl?: string;
    rfc?: string;
    businessName?: string;
    taxRegime?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    primaryPrinterIp?: string;
    secondaryPrinterIp?: string;
    kdsNotificationSoundUrl?: string;
    restaurantLatitude?: number;
    restaurantLongitude?: number;
    directionsApiKey?: string;
    openCageApiKey?: string;
    mercadoPagoAccessToken?: string;
    enabledPaymentMethods?: string[];
    deliveryArea: any;
    invoicingAppUrl?: string;
}
