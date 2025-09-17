import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SmtpSettings } from './dto/smtp-settings.dto';
import { TestSmtpDto } from './dto/test-smtp.dto';
import { createTransport } from 'nodemailer';

@Injectable()
export class SmtpService {
  private readonly logger = new Logger(SmtpService.name);

  constructor(private readonly settingsService: SettingsService) {}

  async getSmtpSettings(): Promise<SmtpSettings> {
    const settings = await this.settingsService.getAllSettings();
    return {
      SMTP_HOST: settings.SMTP_HOST || '',
      SMTP_PORT: settings.SMTP_PORT || '',
      SMTP_USER: settings.SMTP_USER || '',
      SMTP_PASS: '', // Never return the password
      APP_NAME: settings.APP_NAME || 'Mozzarella Cloud',
    };
  }

  async saveSmtpSettings(smtpSettings: SmtpSettings): Promise<void> {
    const settingsToSave: Record<string, string> = {
      SMTP_HOST: smtpSettings.SMTP_HOST,
      SMTP_PORT: smtpSettings.SMTP_PORT,
      SMTP_USER: smtpSettings.SMTP_USER,
      APP_NAME: smtpSettings.APP_NAME,
    };
    // Only update password if a new one is provided and is not just whitespace
    if (smtpSettings.SMTP_PASS && smtpSettings.SMTP_PASS.trim() !== '') {
      settingsToSave.SMTP_PASS = smtpSettings.SMTP_PASS;
    }
    await this.settingsService.updateSettings({ settings: settingsToSave });
  }

  async testSmtpConnection(testSmtpDto: TestSmtpDto): Promise<{ success: boolean; message: string }> {
    const { recipientEmail, smtpSettings } = testSmtpDto;
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = smtpSettings;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER) {
      return { success: false, message: 'Faltan datos de configuración SMTP.' };
    }

    // If password is not provided in the test, try to get it from saved settings
    const finalPass = SMTP_PASS || (await this.settingsService.getSetting('SMTP_PASS'));
    if (!finalPass) {
      return { success: false, message: 'La contraseña SMTP es requerida para la prueba.' };
    }

    const transporter = createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: { user: SMTP_USER, pass: finalPass },
      tls: { rejectUnauthorized: false }, // Useful for local/dev environments
    });

    try {
      await transporter.verify();
      this.logger.log('Conexión SMTP de prueba exitosa.');
      await transporter.sendMail({
        from: `"${smtpSettings.APP_NAME || 'Mozzarella Cloud Test'}" <${SMTP_USER}>`,
        to: recipientEmail,
        subject: 'Prueba de Conexión SMTP - Mozzarella Cloud',
        text: '¡Tu configuración SMTP funciona correctamente!',
        html: '<b>¡Tu configuración SMTP funciona correctamente!</b>',
      });
      this.logger.log(`Email de prueba enviado a ${recipientEmail}`);
      return { success: true, message: 'Conexión exitosa. Se ha enviado un correo de prueba.' };
    } catch (error) {
      this.logger.error('Fallo en la prueba de conexión SMTP:', error);
      return { success: false, message: `Error: ${error.message}` };
    }
  }

  async sendConfiguredTestEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const { transport, from } = await this.settingsService.getSmtpTransportOptions();
      const transporter = createTransport(transport);
      await transporter.sendMail({
        from,
        to: email,
        subject: 'Prueba de Conexión SMTP - Mozzarella Cloud',
        text: '¡Tu configuración SMTP guardada funciona correctamente!',
        html: '<b>¡Tu configuración SMTP guardada funciona correctamente!</b>',
      });
      return { success: true, message: 'Correo de prueba enviado con éxito.' };
    } catch (error) {
      this.logger.error('Fallo al enviar correo de prueba con configuración guardada:', error);
      return { success: false, message: `Error: ${error.message}` };
    }
  }
}