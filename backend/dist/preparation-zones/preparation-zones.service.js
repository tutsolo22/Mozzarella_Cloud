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
exports.PreparationZonesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const preparation_zone_entity_1 = require("./entities/preparation-zone.entity");
const product_entity_1 = require("../products/entities/product.entity");
let PreparationZonesService = class PreparationZonesService {
    constructor(zoneRepository, productRepository) {
        this.zoneRepository = zoneRepository;
        this.productRepository = productRepository;
    }
    create(createDto, tenantId, locationId) {
        const zone = this.zoneRepository.create({ ...createDto, tenantId, locationId });
        return this.zoneRepository.save(zone);
    }
    findAll(tenantId, locationId) {
        return this.zoneRepository.find({ where: { tenantId, locationId }, order: { name: 'ASC' } });
    }
    async findOne(id, tenantId, locationId) {
        const zone = await this.zoneRepository.findOneBy({ id, tenantId, locationId });
        if (!zone) {
            throw new common_1.NotFoundException(`Zona de preparación con ID "${id}" no encontrada.`);
        }
        return zone;
    }
    async update(id, updateDto, tenantId, locationId) {
        await this.findOne(id, tenantId, locationId);
        const zone = await this.zoneRepository.preload({ id, ...updateDto });
        return this.zoneRepository.save(zone);
    }
    async remove(id, tenantId, locationId) {
        const zone = await this.findOne(id, tenantId, locationId);
        const productCount = await this.productRepository.count({
            where: { preparationZoneId: id, locationId },
        });
        if (productCount > 0) {
            throw new common_1.ConflictException(`No se puede eliminar la zona "${zone.name}" porque tiene ${productCount} productos asociados.`);
        }
        const result = await this.zoneRepository.delete({ id, tenantId, locationId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Zona de preparación con ID "${id}" no encontrada.`);
        }
    }
};
exports.PreparationZonesService = PreparationZonesService;
exports.PreparationZonesService = PreparationZonesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(preparation_zone_entity_1.PreparationZone)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PreparationZonesService);
//# sourceMappingURL=preparation-zones.service.js.map