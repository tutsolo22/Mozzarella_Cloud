import { IsString, IsOptional, IsNotEmpty, IsPort } from 'class-validator';

export class SmtpSettings {
  @IsString()
  @IsNotEmpty()
  SMTP_HOST: string;

  @IsPort()
  @IsNotEmpty()
  SMTP_PORT: string;

  @IsString()
  @IsNotEmpty()
  SMTP_USER: string;

  @IsString()
  @IsOptional()
  SMTP_PASS: string;

  @IsString()
  @IsOptional()
  APP_NAME?: string;
}