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
var GeocodingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeocodingService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const axios_2 = require("axios");
const rxjs_1 = require("rxjs");
const typeorm_1 = require("@nestjs/typeorm");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const typeorm_2 = require("typeorm");
let GeocodingService = GeocodingService_1 = class GeocodingService {
    constructor(httpService, configService, tenantRepository) {
        this.httpService = httpService;
        this.configService = configService;
        this.tenantRepository = tenantRepository;
        this.logger = new common_1.Logger(GeocodingService_1.name);
        this.defaultApiKey = this.configService.get('OPENCAGE_API_KEY');
    }
    async geocode(address, tenantId) {
        const tenant = await this.tenantRepository.findOne({
            where: { id: tenantId },
            relations: ['configuration'],
        });
        const apiKey = tenant?.configuration?.openCageApiKey ?? this.defaultApiKey;
        if (!apiKey) {
            this.logger.warn(`No se proporcionó API Key para geocodificación (Tenant: ${tenantId}). Saltando geocodificación.`);
            return null;
        }
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}&language=es&countrycode=ar`;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url).pipe((0, rxjs_1.catchError)(error => {
                if (axios_2.default.isAxiosError(error)) {
                    this.logger.error(`Error de Axios en geocodificación: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
                }
                throw error;
            })));
            if (response.data?.status?.code === 200 && response.data.results.length > 0) {
                return response.data.results[0].geometry;
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Fallo en la geocodificación para la dirección: "${address}"`, error.stack);
            return null;
        }
    }
};
exports.GeocodingService = GeocodingService;
exports.GeocodingService = GeocodingService = GeocodingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        typeorm_2.Repository])
], GeocodingService);
//# sourceMappingURL=geocoding.service.js.map