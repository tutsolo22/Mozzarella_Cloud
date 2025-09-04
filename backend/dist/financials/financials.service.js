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
exports.FinancialsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const overhead_cost_entity_1 = require("./entities/overhead-cost.entity");
let FinancialsService = class FinancialsService {
    constructor(costRepository) {
        this.costRepository = costRepository;
    }
    create(createDto, tenantId, locationId) {
        const cost = this.costRepository.create({ ...createDto, tenantId, locationId });
        return this.costRepository.save(cost);
    }
    findAll(tenantId, startDate, endDate, locationId) {
        const whereClause = { tenantId };
        if (locationId) {
            whereClause.locationId = locationId;
        }
        if (startDate && endDate) {
            const toDate = new Date(endDate);
            toDate.setDate(toDate.getDate() + 1);
            whereClause.costDate = (0, typeorm_2.Between)(new Date(startDate), toDate);
        }
        return this.costRepository.find({ where: whereClause, order: { costDate: 'DESC' } });
    }
    findAllForLocation(locationId, startDate, endDate) {
        const toDate = new Date(endDate);
        toDate.setDate(toDate.getDate() + 1);
        return this.costRepository.find({
            where: {
                locationId,
                costDate: (0, typeorm_2.Between)(new Date(startDate), toDate),
            },
        });
    }
    async update(id, updateDto, tenantId, locationId) {
        const where = { id, tenantId };
        if (locationId) {
            where.locationId = locationId;
        }
        const existingCost = await this.costRepository.findOneBy(where);
        if (!existingCost) {
            throw new common_1.NotFoundException(`Costo con ID "${id}" no encontrado o no pertenece a tu sucursal.`);
        }
        const cost = await this.costRepository.preload({ id, ...updateDto });
        return this.costRepository.save(cost);
    }
    async remove(id, tenantId, locationId) {
        const where = { id, tenantId };
        if (locationId) {
            where.locationId = locationId;
        }
        const result = await this.costRepository.delete(where);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Costo con ID "${id}" no encontrado o no pertenece a tu sucursal.`);
        }
    }
};
exports.FinancialsService = FinancialsService;
exports.FinancialsService = FinancialsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(overhead_cost_entity_1.OverheadCost)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FinancialsService);
//# sourceMappingURL=financials.service.js.map