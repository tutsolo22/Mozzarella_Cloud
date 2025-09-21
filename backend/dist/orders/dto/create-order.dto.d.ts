import { OrderType, PaymentMethod } from '../enums/order-types.enum';
import { OrderChannel } from '../enums/order-channel.enum';
export declare class CreateOrderItemDto {
    productId: string;
    quantity: number;
    notes?: string;
}
export declare class CreateOrderDto {
    customerId?: string;
    orderType: OrderType;
    paymentMethod: PaymentMethod;
    deliveryAddress?: string;
    items: CreateOrderItemDto[];
    channel?: OrderChannel;
}
