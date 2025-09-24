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
var TenantsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("./entities/tenant.entity");
const tenant_configuration_entity_1 = require("../tenant-configuration/entities/tenant-configuration.entity");
const files_service_1 = require("../files/files.service");
const path = require("path");
const hexafact_integration_service_1 = require("../integrations/hexafact/hexafact-integration.service");
let TenantsService = TenantsService_1 = class TenantsService {
    constructor(tenantConfigRepository, tenantRepository, filesService, hexaFactIntegrationService, logger) {
        this.tenantConfigRepository = tenantConfigRepository;
        this.tenantRepository = tenantRepository;
        this.filesService = filesService;
        this.hexaFactIntegrationService = hexaFactIntegrationService;
        this.logger = logger;
        this.logger = new common_1.Logger(TenantsService_1.name);
    }
    async findOne(id) {
        const tenant = await this.tenantRepository.findOne({
            where: { id },
            relations: ['configuration'],
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant con ID "${id}" no encontrado.`);
        }
        return tenant;
    }
    async findByApiKey(apiKey) {
        const tenant = await this.tenantRepository.findOne({
            where: { whatsappApiKey: apiKey },
            relations: ['configuration'],
        });
        if (!tenant) {
            throw new common_2.UnauthorizedException('API Key inválida.');
        }
        return tenant;
    }
    async getConfiguration(tenantId) {
        const config = await this.tenantConfigRepository.findOneBy({ tenantId });
        if (!config) {
            throw new common_1.NotFoundException('Configuración del negocio no encontrada.');
        }
        return config;
    }
    async updateConfiguration(tenantId, updateConfigDto, updateConfigDto) {
        const currentConfig = await this.getConfiguration(tenantId);
        const wasHexaFactEnabled = currentConfig.isHexaFactIntegrationEnabled;
        const allowedUpdates = ['deliveryArea', 'directionsApiKey'];
        for (const key of allowedUpdates) {
            if (updateConfigDto[key] !== undefined) {
                config[key] = updateConfigDto[key];
                Object.assign(currentConfig, updateConfigDto);
                const updatedConfig = await this.tenantConfigRepository.save(currentConfig);
                if (updatedConfig.isHexaFactIntegrationEnabled && !wasHexaFactEnabled) {
                    this.logger.log(`La integración con HexaFact fue activada para el tenant ${tenantId}. Iniciando registro.`);
                    const tenant = await this.tenantRepository.findOne({
                        where: { id: tenantId },
                        relations: ['users', 'users.role'],
                    });
                    if (tenant) {
                        await this.hexaFactIntegrationService.registerTenant(tenant);
                    }
                }
                return this.tenantConfigRepository.save(config);
                return updatedConfig;
            }
            async;
            setKdsSound(tenantId, string, file, Express.Multer.File | null);
            Promise < tenant_configuration_entity_1.TenantConfiguration > {
                const: config = await this.getConfiguration(tenantId),
                if(config) { }, : .kdsNotificationSoundUrl
            };
            {
                try {
                    const oldFileKey = path.basename(config.kdsNotificationSoundUrl);
                    if (oldFileKey) {
                        await this.filesService.deletePublicFile(oldFileKey, tenantId);
                    }
                }
                catch (error) {
                    this.logger.warn(`No se pudo eliminar el archivo de sonido anterior: ${error.message}`);
                }
            }
            if (!file) {
                config.kdsNotificationSoundUrl = null;
            }
            else {
                const uploadedFile = await this.filesService.uploadPublicFile(file, tenantId);
                config.kdsNotificationSoundUrl = uploadedFile.url;
            }
            return this.tenantConfigRepository.save(config);
        }
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = TenantsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_configuration_entity_1.TenantConfiguration)),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        files_service_1.FilesService,
        hexafact_integration_service_1.HexaFactIntegrationService,
        common_1.Logger])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map