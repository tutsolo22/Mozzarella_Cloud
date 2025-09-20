import { OrderType, PaymentMethod } from '../enums/order-types.enum';
import { OrderChannel } from '../enums/order-channel.enum';
declare class OrderItemDto {
    productId: string;
    quantity: number;
    notes?: string;
}
export declare class CreateOrderDto {
    customerId?: string;
    orderType: OrderType;
    paymentMethod: PaymentMethod;
    channel: OrderChannel;
    deliveryAddress?: string;
    items: OrderItemDto[];
    deliveryFee?: number;
}
export {};
