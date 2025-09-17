import { SettingsService } from './settings.service';
import { SmtpSettings } from './dto/smtp-settings.dto';
import { TestSmtpDto } from './dto/test-smtp.dto';
export declare class SmtpService {
    private readonly settingsService;
    private readonly logger;
    constructor(settingsService: SettingsService);
    getSmtpSettings(): Promise<SmtpSettings>;
    saveSmtpSettings(smtpSettings: SmtpSettings): Promise<void>;
    testSmtpConnection(testSmtpDto: TestSmtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    sendConfiguredTestEmail(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
