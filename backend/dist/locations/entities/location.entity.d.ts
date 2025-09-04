import { Tenant } from '../../tenants/entities/tenant.entity';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
export declare class Location {
    id: string;
    name: string;
    address: string;
    phone?: string;
    tenantId: string;
    tenant: Tenant;
    orders: Order[];
    users: User[];
    deliveryArea?: any;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
