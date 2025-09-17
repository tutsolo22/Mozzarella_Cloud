import { IsString, IsNumber, IsBoolean, IsNotEmpty } from 'class-validator';

export class TestSmtpDto {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsNumber()
  port: number;

  @IsBoolean()
  secure: boolean;

  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  pass: string;
}