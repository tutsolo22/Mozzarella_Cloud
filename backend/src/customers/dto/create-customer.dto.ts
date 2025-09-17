import { IsString, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsPhoneNumber() // Validates an international phone number (E.164 format recommended).
  @IsNotEmpty()
  phoneNumber: string;
}