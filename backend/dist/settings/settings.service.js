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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const setting_entity_1 = require("./entities/setting.entity");
const config_1 = require("@nestjs/config");
let SettingsService = SettingsService_1 = class SettingsService {
    constructor(settingsRepository, configService) {
        this.settingsRepository = settingsRepository;
        this.configService = configService;
        this.logger = new common_1.Logger(SettingsService_1.name);
    }
    async getSetting(key, defaultValue) {
        const setting = await this.settingsRepository.findOneBy({ key });
        if (setting) {
            return setting.value;
        }
        const envValue = this.configService.get(key);
        return envValue || defaultValue;
    }
    async getAllSettings() {
        const settings = await this.settingsRepository.find();
        const settingsMap = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
        return settingsMap;
    }
    async updateSettings(updateSettingsDto) {
        const { settings } = updateSettingsDto;
        const settingEntities = Object.entries(settings).map(([key, value]) => {
            return this.settingsRepository.create({ key, value });
        });
        await this.settingsRepository.save(settingEntities);
        this.logger.log('Configuraciones actualizadas en la base de datos.');
    }
    async getSmtpTransportOptions() {
        const host = await this.getSetting('SMTP_HOST');
        const port = await this.getSetting('SMTP_PORT');
        const user = await this.getSetting('SMTP_USER');
        const pass = await this.getSetting('SMTP_PASS');
        const secure = await this.getSetting('SMTP_SECURE');
        if (!host || !port || !user || !pass) {
            this.logger.error('Faltan una o más configuraciones SMTP en la base de datos o variables de entorno.');
            throw new Error('Configuración SMTP incompleta.');
        }
        const portNumber = parseInt(port, 10);
        const isSecure = secure !== undefined ? secure === 'true' : portNumber === 465;
        const transport = { host, port: portNumber, secure: isSecure, auth: { user, pass } };
        const from = `"${await this.getSetting('APP_NAME', 'Mozzarella Cloud')}" <${user}>`;
        return { transport, from };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(setting_entity_1.Setting)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map