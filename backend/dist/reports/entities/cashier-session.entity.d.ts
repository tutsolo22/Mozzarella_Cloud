import { User } from '../../users/entities/user.entity';
export declare class CashierSession {
    id: string;
    tenantId: string;
    openedByUser: User;
    openedByUserId: string;
    closedByUser?: User;
    closedByUserId?: string;
    openedAt: Date;
    closedAt?: Date;
    openingBalance: number;
    closingBalance?: number;
    totalSales?: number;
    calculatedCash?: number;
    calculatedCard?: number;
    calculatedOther?: number;
    difference?: number;
    notes?: string;
    updatedAt: Date;
}
