import { IsString, IsNotEmpty, IsPhoneNumber, IsOptional, IsNumber, IsLatitude, IsLongitude } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsPhoneNumber() // Validates an international phone number (E.164 format recommended).
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @IsLongitude()
  longitude?: number;
}