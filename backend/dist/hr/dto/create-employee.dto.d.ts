import { PaymentFrequency } from '../entities/employee.entity';
export declare class CreateEmployeeDto {
    userId: string;
    positionId: string;
    salary: number;
    paymentFrequency: PaymentFrequency;
    hireDate: string;
}
