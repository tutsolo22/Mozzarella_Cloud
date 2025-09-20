import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class TestSmtpDto {
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico de destinatario válido.' })
  @IsNotEmpty({
    message: 'El correo electrónico del destinatario no puede estar vacío.',
  })
  recipientEmail: string;

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
  pass?: string;

  @IsBoolean({ message: 'El campo "secure" (SSL/TLS) debe ser un valor booleano.' })
  @IsOptional()
  secure?: boolean;

  @IsString({ message: 'El nombre de la aplicación debe ser una cadena de texto.' })
  @IsOptional()
  appName?: string;
}