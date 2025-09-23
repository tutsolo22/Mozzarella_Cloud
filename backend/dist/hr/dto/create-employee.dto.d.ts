import { PaymentFrequency } from '../entities/employee.entity';
export declare class CreateEmployeeDto {
    fullName: string;
    positionId: string;
    salary: number;
    paymentFrequency: PaymentFrequency;
    hireDate: string;
    createSystemUser: boolean;
    email?: string;
    roleId?: string;
}
