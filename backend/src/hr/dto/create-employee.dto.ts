import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsPositive,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsEmail,
  ValidateIf,
} from 'class-validator';
import { PaymentFrequency } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsUUID()
  @IsNotEmpty()
  positionId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  salary: number;

  @IsEnum(PaymentFrequency)
  paymentFrequency: PaymentFrequency;

  @IsDateString()
  hireDate: string;

  @IsBoolean()
  createSystemUser: boolean;

  @ValidateIf(o => o.createSystemUser)
  @IsEmail({}, { message: 'El email debe ser un correo válido.' })
  @IsNotEmpty({ message: 'El email es requerido para crear un acceso al sistema.' })
  email?: string;

  @ValidateIf(o => o.createSystemUser)
  @IsUUID()
  @IsNotEmpty({ message: 'El rol es requerido para crear un acceso al sistema.' })
  roleId?: string;
}