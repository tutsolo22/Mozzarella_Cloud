export interface SmtpSettings {
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  APP_NAME?: string;
}

export interface TestSmtpDto {
  recipientEmail: string;
  smtpSettings: SmtpSettings;
}