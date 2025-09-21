import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderType, PaymentMethod, PaymentStatus } from '../enums/order-types.enum';
import { OrderChannel } from '../enums/order-channel.enum';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Location } from '../../locations/entities/location.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
export declare enum DeliveryProviderType {
    InHouse = "in_house",
    External = "external"
}
export declare class Order {
    id: string;
    shortId: string;
    tenantId: string;
    tenant: Tenant;
    locationId: string;
    location: Location;
    customerId?: string;
    customer: Customer;
    assignedDriver?: User;
    channel: OrderChannel;
    assignedDriverId?: string;
    status: OrderStatus;
    orderType: OrderType;
    totalAmount: number;
    totalWeightKg: number;
    totalVolumeM3: number;
    items: OrderItem[];
    deliveryAddress?: string;
    latitude?: number;
    longitude?: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentGatewayId?: string;
    paymentLink?: string;
    preparationTimeMinutes: number | null;
    estimatedDeliveryAt: Date | null;
    assignedAt: Date | null;
    deliveredAt: Date | null;
    deliverySequence?: number;
    notes: string;
    pickupNotificationSent: boolean;
    estimatedPickupArrivalAt: Date | null;
    isPriority: boolean;
    deliveryProvider: DeliveryProviderType;
    externalDeliveryProvider?: string;
    deliveryFee: number;
    createdAt: Date;
    updatedAt: Date;
    generateShortId(): void;
    isBilled: boolean;
    invoiceUrl?: string;
}
