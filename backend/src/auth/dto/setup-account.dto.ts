import { IsString, MinLength } from 'class-validator';

export class SetupAccountDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  password: string;
}