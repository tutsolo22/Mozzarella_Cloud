import { OrderType } from '../enums/order-type.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
declare class OrderItemDto {
    productId: string;
    quantity: number;
    notes?: string;
}
export declare class CreateOrderDto {
    customerId: string;
    orderType: OrderType;
    paymentMethod: PaymentMethod;
    deliveryAddress: string;
    items: OrderItemDto[];
}
export {};
