import { IsEmail, IsNotEmpty, IsString, MinLength, IsUUID, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsUUID()
  roleId: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;
}