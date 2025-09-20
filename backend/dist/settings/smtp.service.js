"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SmtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmtpService = void 0;
const common_1 = require("@nestjs/common");
const settings_service_1 = require("./settings.service");
const nodemailer_1 = require("nodemailer");
let SmtpService = SmtpService_1 = class SmtpService {
    constructor(settingsService) {
        this.settingsService = settingsService;
        this.logger = new common_1.Logger(SmtpService_1.name);
    }
    async getSmtpSettings() {
        const settings = await this.settingsService.getAllSettings();
        const port = parseInt(settings.SMTP_PORT || '0', 10);
        const secureSetting = settings.SMTP_SECURE;
        return {
            host: settings.SMTP_HOST || '',
            port: port,
            user: settings.SMTP_USER || '',
            pass: '',
            appName: settings.APP_NAME !== undefined ? settings.APP_NAME : 'Mozzarella Cloud',
            secure: secureSetting !== undefined ? secureSetting === 'true' : port === 465,
        };
    }
    async saveSmtpSettings(smtpSettings) {
        const settingsToSave = {
            SMTP_HOST: smtpSettings.host,
            SMTP_PORT: smtpSettings.port.toString(),
            SMTP_USER: smtpSettings.user,
            APP_NAME: smtpSettings.appName !== undefined ? smtpSettings.appName : 'Mozzarella Cloud',
            SMTP_SECURE: (smtpSettings.secure ?? smtpSettings.port === 465).toString(),
        };
        if (smtpSettings.pass && smtpSettings.pass.trim() !== '') {
            settingsToSave.SMTP_PASS = smtpSettings.pass;
        }
        await this.settingsService.updateSettings({ settings: settingsToSave });
    }
    async testSmtpConnection(smtpSettings) {
        const { host, port, user, pass, secure } = smtpSettings;
        if (!host || !port || !user) {
            return { success: false, message: 'Faltan datos de configuración SMTP.' };
        }
        const finalPass = pass || (await this.settingsService.getSetting('SMTP_PASS'));
        if (!finalPass) {
            return { success: false, message: 'La contraseña SMTP es requerida para la prueba.' };
        }
        const transporter = (0, nodemailer_1.createTransport)({
            host: host,
            port: port,
            secure: secure ?? port === 465,
            auth: { user: user, pass: finalPass },
            tls: { rejectUnauthorized: false },
        });
        try {
            await transporter.verify();
            this.logger.log('Verificación de conexión SMTP exitosa.');
            return { success: true, message: 'Conexión exitosa. Las credenciales son válidas.' };
        }
        catch (error) {
            this.logger.error('Fallo en la prueba de conexión SMTP:', error);
            return { success: false, message: `Error: ${error.message}` };
        }
    }
    async sendTestEmailWithUnsavedSettings(testSmtpDto) {
        const { recipientEmail, host, port, user, pass, appName, secure } = testSmtpDto;
        if (!host || !port || !user) {
            return { success: false, message: 'Faltan datos de configuración SMTP.' };
        }
        const finalPass = pass || (await this.settingsService.getSetting('SMTP_PASS'));
        if (!finalPass) {
            return { success: false, message: 'La contraseña SMTP es requerida para la prueba.' };
        }
        const transporter = (0, nodemailer_1.createTransport)({
            host: host,
            port: port,
            secure: secure ?? port === 465,
            auth: { user: user, pass: finalPass },
            tls: { rejectUnauthorized: false },
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
        }
        catch (error) {
            this.logger.error('Fallo al enviar correo de prueba con configuración de formulario:', error);
            return { success: false, message: `Error: ${error.message}` };
        }
    }
    async sendConfiguredTestEmail(email) {
        try {
            const { transport, from } = await this.settingsService.getSmtpTransportOptions();
            const transporter = (0, nodemailer_1.createTransport)(transport);
            await transporter.sendMail({
                from,
                to: email,
                subject: 'Prueba de Conexión SMTP - Mozzarella Cloud',
                text: '¡Tu configuración SMTP guardada funciona correctamente!',
                html: '<b>¡Tu configuración SMTP guardada funciona correctamente!</b>',
            });
            return { success: true, message: 'Correo de prueba enviado con éxito.' };
        }
        catch (error) {
            this.logger.error('Fallo al enviar correo de prueba con configuración guardada:', error);
            return { success: false, message: `Error: ${error.message}` };
        }
    }
};
exports.SmtpService = SmtpService;
exports.SmtpService = SmtpService = SmtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SmtpService);
//# sourceMappingURL=smtp.service.js.map