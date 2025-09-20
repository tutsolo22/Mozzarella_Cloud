import { SmtpService } from './smtp.service';
import { SmtpSettingsDto } from './dto/smtp-settings.dto';
import { TestSmtpDto } from './dto/test-smtp.dto';
export declare class SmtpController {
    private readonly smtpService;
    constructor(smtpService: SmtpService);
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
