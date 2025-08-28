import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del restaurante no puede estar vacío.' })
  tenantName: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre completo no puede estar vacío.' })
  fullName: string;

  @IsEmail({}, { message: 'Debe proporcionar un email válido.' })
  email: string;

  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password: string;
}