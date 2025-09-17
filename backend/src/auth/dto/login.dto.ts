import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  remember?: boolean;
}