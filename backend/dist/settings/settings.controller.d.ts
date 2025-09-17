import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    findAll(): Promise<Record<string, string>>;
    update(updateSettingsDto: UpdateSettingsDto): Promise<void>;
}
