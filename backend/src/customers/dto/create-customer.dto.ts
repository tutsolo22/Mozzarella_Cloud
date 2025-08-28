import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsJSON,
  IsPhoneNumber,
} from 'class-validator';

export class CreateCustomerDto {
  @IsPhoneNumber(null) // Validación agnóstica a la región
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsJSON()
  @IsOptional()
  addresses?: string; // El JSON se recibe como string
}