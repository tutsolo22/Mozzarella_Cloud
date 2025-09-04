import { OrderType, PaymentMethod } from '../enums/order-types.enum';
declare class OrderItemDto {
    productId: string;
    quantity: number;
    notes?: string;
}
export declare class CreateOrderDto {
    customerId?: string;
    orderType: OrderType;
    paymentMethod: PaymentMethod;
    deliveryAddress?: string;
    items: OrderItemDto[];
    deliveryFee?: number;
}
export {};
