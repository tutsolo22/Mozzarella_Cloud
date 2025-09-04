import { User } from '../../users/entities/user.entity';
import { Position } from './position.entity';
export declare enum PaymentFrequency {
    Daily = "daily",
    Weekly = "weekly",
    BiWeekly = "bi-weekly",
    Monthly = "monthly"
}
export declare class Employee {
    id: string;
    tenantId: string;
    user: User;
    userId: string;
    position: Position;
    positionId: string;
    salary: number;
    paymentFrequency: PaymentFrequency;
    hireDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
