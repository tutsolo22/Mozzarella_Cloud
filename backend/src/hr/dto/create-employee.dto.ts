import { IsString, IsNotEmpty, IsUUID, IsNumber, IsPositive, IsEnum, IsDateString } from 'class-validator';
import { PaymentFrequency } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  positionId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  salary: number;

  @IsEnum(PaymentFrequency)
  @IsNotEmpty()
  paymentFrequency: PaymentFrequency;

  @IsDateString()
  @IsNotEmpty()
  hireDate: string;
}