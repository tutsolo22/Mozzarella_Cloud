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
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const promotion_entity_1 = require("./entities/promotion.entity");
const product_entity_1 = require("../products/entities/product.entity");
const location_entity_1 = require("../locations/entities/location.entity");
let PromotionsService = class PromotionsService {
    constructor(promotionRepository, productRepository, locationRepository) {
        this.promotionRepository = promotionRepository;
        this.productRepository = productRepository;
        this.locationRepository = locationRepository;
    }
    async create(createDto, tenantId) {
        const { productIds, ...promotionData } = createDto;
        const products = await this.productRepository.findBy({ id: (0, typeorm_2.In)(productIds), tenantId });
        const promotion = this.promotionRepository.create({
            ...promotionData,
            tenantId,
            products,
        });
        return this.promotionRepository.save(promotion);
    }
    findAll(tenantId) {
        return this.promotionRepository.find({ where: { tenantId }, relations: ['products'] });
    }
    async findOne(id, tenantId) {
        const promotion = await this.promotionRepository.findOne({ where: { id, tenantId }, relations: ['products'] });
        if (!promotion) {
            throw new common_1.NotFoundException(`Promoción con ID "${id}" no encontrada.`);
        }
        return promotion;
    }
    async update(id, updateDto, tenantId) {
        const { productIds, ...promotionData } = updateDto;
        const promotion = await this.findOne(id, tenantId);
        if (productIds) {
            promotion.products = await this.productRepository.findBy({ id: (0, typeorm_2.In)(productIds), tenantId });
        }
        Object.assign(promotion, promotionData);
        return this.promotionRepository.save(promotion);
    }
    async remove(id, tenantId) {
        const result = await this.promotionRepository.delete({ id, tenantId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Promoción con ID "${id}" no encontrada.`);
        }
    }
    async findActiveByLocation(locationId) {
        const location = await this.locationRepository.findOneBy({ id: locationId });
        if (!location) {
            throw new common_1.NotFoundException(`Sucursal con ID "${locationId}" no encontrada.`);
        }
        const now = new Date();
        const promotions = await this.promotionRepository.find({
            where: {
                tenantId: location.tenantId,
                startDate: (0, typeorm_2.LessThanOrEqual)(now),
                endDate: (0, typeorm_2.MoreThanOrEqual)(now),
            },
            relations: ['products'],
            order: {
                endDate: 'ASC',
            },
        });
        return promotions.map(promo => ({
            ...promo,
            products: promo.products.filter(p => p.locationId === locationId && p.isAvailable && !p.deletedAt),
        })).filter(promo => promo.products.length > 0);
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(promotion_entity_1.Promotion)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map