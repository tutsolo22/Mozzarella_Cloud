import { IsString, IsInt, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateSmtpSettingDto {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsInt()
  port: number;

  @IsBoolean()
  secure: boolean;

  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsOptional()
  // La contraseña es opcional. Si no se envía, no se actualiza.
  // El frontend enviará un placeholder si no se cambia.
  pass?: string;
}