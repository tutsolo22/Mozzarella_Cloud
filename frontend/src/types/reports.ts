import { User } from './user';

export interface DriverPerformanceData {
  driverId: string;
  driverName: string;
  totalDeliveries: number;
  totalAmountCollected: number;
  averageDeliveryTimeMinutes: string | null;
}

export interface CashierSession {
  id: string;
  tenantId: string;
  openedByUser: User;
  openedByUserId: string;
  closedByUser?: User;
  closedByUserId?: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: string; // Los decimales del backend a menudo se serializan como strings
  closingBalance?: string;
  totalSales?: string;
  calculatedCash?: string;
  calculatedCard?: string;
  calculatedOther?: string;
  difference?: string;
  notes?: string;
}