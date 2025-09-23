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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantConfigurationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_configuration_entity_1 = require("./entities/tenant-configuration.entity");
let TenantConfigurationService = class TenantConfigurationService {
    constructor(configRepository) {
        this.configRepository = configRepository;
    }
    async getConfiguration(tenantId) {
        const config = await this.configRepository.findOne({
            where: { tenantId: tenantId },
        });
        if (!config) {
            throw new common_1.NotFoundException('Configuración del tenant no encontrada.');
        }
        return config;
    }
    async updateConfiguration(tenantId, updateDto) {
        const config = await this.getConfiguration(tenantId);
        Object.assign(config, updateDto);
        return this.configRepository.save(config);
    }
};
exports.TenantConfigurationService = TenantConfigurationService;
exports.TenantConfigurationService = TenantConfigurationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_configuration_entity_1.TenantConfiguration)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TenantConfigurationService);
//# sourceMappingURL=tenant-configuration.service.js.map