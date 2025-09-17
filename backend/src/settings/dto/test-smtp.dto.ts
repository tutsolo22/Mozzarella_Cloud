import { IsEmail, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SmtpSettings } from './smtp-settings.dto';

export class TestSmtpDto {
  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  @ValidateNested()
  @Type(() => SmtpSettings)
  smtpSettings: SmtpSettings;
}