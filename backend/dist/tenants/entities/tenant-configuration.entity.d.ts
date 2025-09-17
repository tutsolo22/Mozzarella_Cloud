import { Tenant } from './tenant.entity';
export declare class TenantConfiguration {
    id: string;
    tenantId: string;
    tenant: Tenant;
    deliveryArea: any;
    kdsNotificationSoundUrl: string;
    restaurantLatitude: number;
    restaurantLongitude: number;
    directionsApiKey: string;
    openCageApiKey: string;
    mercadoPagoAccessToken: string;
    enabledPaymentMethods: string[];
}
