import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { ConfigService } from '@nestjs/config';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
    private readonly configService: ConfigService,
  ) {}

  async getSetting(key: string, defaultValue?: string): Promise<string | undefined> {
    const setting = await this.settingsRepository.findOneBy({ key });
    if (setting) {
      return setting.value;
    }
    // Fallback to environment variables
    const envValue = this.configService.get<string>(key);
    return envValue || defaultValue;
  }

  async getAllSettings(): Promise<Record<string, string>> {
    const settings = await this.settingsRepository.find();
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
    return settingsMap;
  }

  async updateSettings(updateSettingsDto: UpdateSettingsDto): Promise<void> {
    const { settings } = updateSettingsDto;
    const settingEntities = Object.entries(settings).map(([key, value]) => {
      return this.settingsRepository.create({ key, value });
    });

    // Use `save` to perform an "upsert" operation on the primary key.
    await this.settingsRepository.save(settingEntities);
    this.logger.log('Configuraciones actualizadas en la base de datos.');
  }

  async getSmtpTransportOptions() {
    const host = await this.getSetting('SMTP_HOST');
    const port = await this.getSetting('SMTP_PORT');
    const user = await this.getSetting('SMTP_USER');
    const pass = await this.getSetting('SMTP_PASS');

    if (!host || !port || !user || !pass) {
      this.logger.error('Faltan una o más configuraciones SMTP en la base de datos o variables de entorno.');
      throw new Error('Configuración SMTP incompleta.');
    }

    const transport = { host, port: parseInt(port, 10), secure: parseInt(port, 10) === 465, auth: { user, pass } };
    const from = `"${await this.getSetting('APP_NAME', 'Mozzarella Cloud')}" <${user}>`;
    return { transport, from };
  }
}