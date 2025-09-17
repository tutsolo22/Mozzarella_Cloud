import { User } from './user';

export interface Position {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentFrequency {
  Daily = 'daily',
  Weekly = 'weekly',
  BiWeekly = 'bi-weekly',
  Monthly = 'monthly',
}

export interface Employee {
  id: string;
  user: User;
  position: Position;
  salary: number;
  paymentFrequency: PaymentFrequency;
  hireDate: string;
}

export type CreatePositionDto = Pick<Position, 'name' | 'description'>;
export type UpdatePositionDto = Partial<CreatePositionDto>;

export type CreateEmployeeDto = Omit<Employee, 'id' | 'user' | 'position'> & { userId: string; positionId: string };
export type UpdateEmployeeDto = Partial<Omit<Employee, 'id' | 'user' | 'position' | 'userId'>> & { positionId?: string };