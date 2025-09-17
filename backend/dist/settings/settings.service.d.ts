import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { ConfigService } from '@nestjs/config';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class SettingsService {
    private readonly settingsRepository;
    private readonly configService;
    private readonly logger;
    constructor(settingsRepository: Repository<Setting>, configService: ConfigService);
    getSetting(key: string, defaultValue?: string): Promise<string | undefined>;
    getAllSettings(): Promise<Record<string, string>>;
    updateSettings(updateSettingsDto: UpdateSettingsDto): Promise<void>;
    getSmtpTransportOptions(): Promise<{
        transport: {
            host: string;
            port: number;
            secure: boolean;
            auth: {
                user: string;
                pass: string;
            };
        };
        from: string;
    }>;
}
