import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderType } from '../enums/order-type.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { OrderItem } from './order-item.entity';
export declare class Order {
    id: string;
    shortId: string;
    customer: Customer;
    customerId: string;
    status: OrderStatus;
    orderType: OrderType;
    totalAmount: number;
    deliveryAddress: string;
    assignedDriver: User;
    assignedDriverId: string;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}
