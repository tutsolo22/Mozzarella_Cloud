import { IsOptional, IsUUID, IsNumber, IsPositive, IsEnum, IsDateString } from 'class-validator';
import { PaymentFrequency } from '../entities/employee.entity';

export class UpdateEmployeeDto {
  @IsUUID()
  @IsOptional()
  positionId?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  salary?: number;

  @IsEnum(PaymentFrequency)
  @IsOptional()
  paymentFrequency?: PaymentFrequency;

  @IsDateString()
  @IsOptional()
  hireDate?: string;
}