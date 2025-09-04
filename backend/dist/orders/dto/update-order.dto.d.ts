import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/order-types.enum';
export declare class UpdateOrderDto {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    assignedDriverId?: string;
    paymentLink?: string;
    paymentGatewayId?: string;
}
