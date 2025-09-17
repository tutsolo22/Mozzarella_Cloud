import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  adminFullName: string;

  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;
}