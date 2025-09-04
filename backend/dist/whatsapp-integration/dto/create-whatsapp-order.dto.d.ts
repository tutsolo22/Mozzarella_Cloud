import { OrderType, PaymentMethod } from '../../orders/enums/order-types.enum';
declare class WhatsappOrderItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateWhatsappOrderDto {
    customerPhone: string;
    customerName: string;
    deliveryAddress?: string;
    orderType: OrderType;
    items: WhatsappOrderItemDto[];
    locationId: string;
    paymentMethod: PaymentMethod;
}
export {};
