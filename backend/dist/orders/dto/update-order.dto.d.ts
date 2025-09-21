import { CreateOrderDto } from './create-order.dto';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/order-types.enum';
declare const UpdateOrderDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateOrderDto>>;
export declare class UpdateOrderDto extends UpdateOrderDto_base {
    status?: OrderStatus;
    assignedDriverId?: string;
    paymentStatus?: PaymentStatus;
    paymentGatewayId?: string;
    paymentLink?: string;
    isBilled?: boolean;
    invoiceUrl?: string;
}
export {};
