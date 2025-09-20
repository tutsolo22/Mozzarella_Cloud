import { SettingsService } from './settings.service';
import { SmtpSettingsDto } from './dto/smtp-settings.dto';
import { TestSmtpDto } from './dto/test-smtp.dto';
export declare class SmtpService {
    private readonly settingsService;
    private readonly logger;
    constructor(settingsService: SettingsService);
    getSmtpSettings(): Promise<SmtpSettingsDto>;
    saveSmtpSettings(smtpSettings: SmtpSettingsDto): Promise<void>;
    testSmtpConnection(smtpSettings: SmtpSettingsDto): Promise<{
        success: boolean;
        message: string;
    }>;
    sendTestEmailWithUnsavedSettings(testSmtpDto: TestSmtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    sendConfiguredTestEmail(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
