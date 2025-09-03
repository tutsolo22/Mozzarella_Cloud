export enum CostFrequency {
  OneTime = 'one-time',
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
}

export interface OverheadCost {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  amount: string; // Decimal from backend
  frequency: CostFrequency;
  costDate: string; // Date string from backend
  updatedAt: string;
}