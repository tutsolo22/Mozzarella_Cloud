import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
export declare class UpdateOrderDto {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    assignedDriverId?: string;
}
