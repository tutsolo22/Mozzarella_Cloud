import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SmtpSettingsDto } from './dto/smtp-settings.dto';
import { TestSmtpDto } from './dto/test-smtp.dto';
import { createTransport } from 'nodemailer';

@Injectable()
export class SmtpService {
  private readonly logger = new Logger(SmtpService.name);

  constructor(private readonly settingsService: SettingsService) {}

  async getSmtpSettings(): Promise<SmtpSettingsDto> {
    const settings = await this.settingsService.getAllSettings();
    const port = parseInt(settings.SMTP_PORT || '0', 10);
    const secureSetting = settings.SMTP_SECURE;

    return {
      host: settings.SMTP_HOST || '',
      port: port,
      user: settings.SMTP_USER || '',
      pass: '', // Never return the password
      appName: settings.APP_NAME !== undefined ? settings.APP_NAME : 'Mozzarella Cloud',
      // Prioriza el valor guardado, si no existe, lo deriva del puerto.
      secure: secureSetting !== undefined ? secureSetting === 'true' : port === 465,
    };
  }

  async saveSmtpSettings(smtpSettings: SmtpSettingsDto): Promise<void> {
    const settingsToSave: Record<string, string> = {
      SMTP_HOST: smtpSettings.host,
      SMTP_PORT: smtpSettings.port.toString(),
      SMTP_USER: smtpSettings.user,
      APP_NAME: smtpSettings.appName !== undefined ? smtpSettings.appName : 'Mozzarella Cloud',
      SMTP_SECURE: (smtpSettings.secure ?? smtpSettings.port === 465).toString(),
    };
    // Only update password if a new one is provided and is not just whitespace
    if (smtpSettings.pass && smtpSettings.pass.trim() !== '') {
      settingsToSave.SMTP_PASS = smtpSettings.pass;
    }
    await this.settingsService.updateSettings({ settings: settingsToSave });
  }

  async testSmtpConnection(smtpSettings: SmtpSettingsDto): Promise<{ success: boolean; message: string }> {
    const { host, port, user, pass, secure } = smtpSettings;

    if (!host || !port || !user) {
      return { success: false, message: 'Faltan datos de configuración SMTP.' };
    }

    // If password is not provided in the test, try to get it from saved settings
    const finalPass = pass || (await this.settingsService.getSetting('SMTP_PASS'));
    if (!finalPass) {
      return { success: false, message: 'La contraseña SMTP es requerida para la prueba.' };
    }

    const transporter = createTransport({
      host: host,
      port: port,
      secure: secure ?? port === 465,
      auth: { user: user, pass: finalPass },
      tls: { rejectUnauthorized: false }, // Useful for local/dev environments
    });

    try {
      await transporter.verify();
      this.logger.log('Verificación de conexión SMTP exitosa.');
      return { success: true, message: 'Conexión exitosa. Las credenciales son válidas.' };
    } catch (error) {
      this.logger.error('Fallo en la prueba de conexión SMTP:', error);
      return { success: false, message: `Error: ${error.message}` };
    }
  }

  async sendTestEmailWithUnsavedSettings(testSmtpDto: TestSmtpDto): Promise<{ success: boolean; message: string }> {
    const { recipientEmail, host, port, user, pass, appName, secure } = testSmtpDto;

    if (!host || !port || !user) {
      return { success: false, message: 'Faltan datos de configuración SMTP.' };
    }

    // If password is not provided in the test, try to get it from saved settings
    const finalPass = pass || (await this.settingsService.getSetting('SMTP_PASS'));
    if (!finalPass) {
      return { success: false, message: 'La contraseña SMTP es requerida para la prueba.' };
    }

    const transporter = createTransport({
      host: host,
      port: port,
      secure: secure ?? port === 465,
      auth: { user: user, pass: finalPass },
      tls: { rejectUnauthorized: false }, // Useful for local/dev environments
    });

    try {
      await transporter.verify();
      this.logger.log('Verificación de conexión SMTP exitosa antes de enviar correo de prueba.');
      await transporter.sendMail({
        from: `"${appName || 'Mozzarella Cloud Test'}" <${user}>`,
        to: recipientEmail,
        subject: 'Prueba de Conexión SMTP - Mozzarella Cloud',
        text: '¡Tu configuración SMTP funciona correctamente!',
        html: '<b>¡Tu configuración SMTP funciona correctamente!</b>',
      });
      this.logger.log(`Email de prueba enviado a ${recipientEmail}`);
      return { success: true, message: 'Conexión exitosa. Se ha enviado un correo de prueba.' };
    } catch (error) {
      this.logger.error('Fallo al enviar correo de prueba con configuración de formulario:', error);
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