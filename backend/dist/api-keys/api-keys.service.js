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
exports.ApiKeysService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const api_key_entity_1 = require("./entities/api-key.entity");
const encryption_service_1 = require("../encryption/encryption.service");
let ApiKeysService = class ApiKeysService {
    constructor(apiKeyRepository, encryptionService) {
        this.apiKeyRepository = apiKeyRepository;
        this.encryptionService = encryptionService;
    }
    async upsert(tenantId, upsertApiKeyDto) {
        const { serviceIdentifier, key } = upsertApiKeyDto;
        const encryptedKey = this.encryptionService.encrypt(key);
        let apiKey = await this.apiKeyRepository.findOneBy({
            tenantId,
            serviceIdentifier,
        });
        if (apiKey) {
            apiKey.key = encryptedKey;
        }
        else {
            apiKey = this.apiKeyRepository.create({
                tenantId,
                serviceIdentifier,
                key: encryptedKey,
            });
        }
        return this.apiKeyRepository.save(apiKey);
    }
    async getDecryptedKey(tenantId, service) {
        const apiKey = await this.apiKeyRepository.findOneBy({
            tenantId,
            serviceIdentifier: service,
        });
        if (!apiKey) {
            return null;
        }
        return this.encryptionService.decrypt(apiKey.key);
    }
    async findAllForTenant(tenantId) {
        return this.apiKeyRepository.find({
            where: { tenantId },
            select: ['id', 'serviceIdentifier', 'createdAt', 'updatedAt'],
        });
    }
    async remove(id, tenantId) {
        const result = await this.apiKeyRepository.delete({ id, tenantId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`API Key con ID ${id} no encontrada para este tenant.`);
        }
    }
};
exports.ApiKeysService = ApiKeysService;
exports.ApiKeysService = ApiKeysService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(api_key_entity_1.ApiKey)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        encryption_service_1.EncryptionService])
], ApiKeysService);
//# sourceMappingURL=api-keys.service.js.map