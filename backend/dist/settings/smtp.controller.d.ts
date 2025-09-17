import { SmtpService } from './smtp.service';
import { SmtpSettings } from './dto/smtp-settings.dto';
import { TestSmtpDto } from './dto/test-smtp.dto';
export declare class SmtpController {
    private readonly smtpService;
    constructor(smtpService: SmtpService);
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
