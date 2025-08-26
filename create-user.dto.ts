import { IsEmail, IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string; // En el servicio, esto se convertirá en passwordHash

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsUUID()
  roleId: string;
}