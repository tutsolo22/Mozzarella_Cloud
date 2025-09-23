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
  fullName: string;
  position: Position;
  salary: number;
  paymentFrequency: PaymentFrequency;
  hireDate: string;
  user?: User | null; // La cuenta de usuario asociada, si existe
  userId?: string | null;
}

export type CreatePositionDto = Pick<Position, 'name' | 'description'>;
export type UpdatePositionDto = Partial<CreatePositionDto>;

export interface CreateEmployeeDto {
  // Campos del empleado
  fullName: string;
  positionId: string;
  salary: number;
  paymentFrequency: PaymentFrequency;
  hireDate: string;

  // Campos opcionales para crear la cuenta de usuario
  createSystemUser: boolean;
  email?: string;
  roleId?: string;
}

export type UpdateEmployeeDto = Partial<Omit<Employee, 'id' | 'user' | 'position' | 'userId'>> & { positionId?: string };