import { Tenant } from '../../tenants/entities/tenant.entity';
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
    tenant: Tenant;
    userId: string;
    user: User;
    positionId: string;
    position: Position;
    salary: number;
    paymentFrequency: PaymentFrequency;
    hireDate: string;
    createdAt: Date;
    updatedAt: Date;
}
