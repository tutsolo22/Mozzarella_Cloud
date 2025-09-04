import { PaymentMethod } from '../../orders/enums/order-types.enum';
export declare class TenantConfiguration {
    id: string;
    tenantId: string;
    directionsApiKey?: string;
    restaurantLatitude?: number;
    restaurantLongitude?: number;
    openCageApiKey?: string;
    mercadoPagoAccessToken?: string;
    enabledPaymentMethods?: PaymentMethod[];
}
