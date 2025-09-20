import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class SmtpSettingsDto {
  @IsString({ message: 'El host SMTP debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El host SMTP no puede estar vacío.' })
  host: string;

  @IsInt({ message: 'El puerto SMTP debe ser un número entero.' })
  @Min(1, { message: 'El puerto SMTP debe ser un número válido (1-65535).' })
  @Max(65535, { message: 'El puerto SMTP debe ser un número válido (1-65535).' })
  @IsNotEmpty({ message: 'El puerto SMTP no puede estar vacío.' })
  port: number;

  @IsString({ message: 'El usuario SMTP debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El usuario SMTP no puede estar vacío.' })
  user: string;

  @IsString({ message: 'La contraseña SMTP debe ser una cadena de texto.' })
  @IsOptional()
  // La contraseña es opcional. Si no se envía, no se actualiza.
  pass?: string;

  @IsBoolean({ message: 'El campo "secure" (SSL/TLS) debe ser un valor booleano.' })
  @IsOptional()
  // Indica si se debe usar una conexión segura (SSL/TLS). Generalmente `true` para el puerto 465.
  secure?: boolean;

  @IsString({ message: 'El nombre de la aplicación debe ser una cadena de texto.' })
  @IsOptional()
  // Si no se provee, se usará "Mozzarella Cloud" por defecto.
  appName?: string;
}