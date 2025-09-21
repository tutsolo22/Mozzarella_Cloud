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
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const location_entity_1 = require("./entities/location.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const order_status_enum_1 = require("../orders/enums/order-status.enum");
let LocationsService = class LocationsService {
    constructor(locationRepository, orderRepository) {
        this.locationRepository = locationRepository;
        this.orderRepository = orderRepository;
    }
    create(createLocationDto, tenantId) {
        const location = this.locationRepository.create({
            ...createLocationDto,
            tenantId,
        });
        return this.locationRepository.save(location);
    }
    findAll(tenantId, includeInactive = false) {
        return this.locationRepository.find({
            where: { tenantId },
            withDeleted: includeInactive,
            order: { name: 'ASC' },
        });
    }
    async findOne(id, tenantId) {
        const location = await this.locationRepository.findOneBy({ id, tenantId });
        if (!location) {
            throw new common_1.NotFoundException(`Sucursal con ID "${id}" no encontrada.`);
        }
        return location;
    }
    async update(id, tenantId, updateLocationDto) {
        const location = await this.locationRepository.preload({
            id,
            ...updateLocationDto,
        });
        if (!location || location.tenantId !== tenantId) {
            throw new common_1.NotFoundException(`Sucursal con ID "${id}" no encontrada.`);
        }
        return this.locationRepository.save(location);
    }
    async disable(id, tenantId) {
        const location = await this.findOne(id, tenantId);
        const activeOrderCount = await this.orderRepository.count({
            where: {
                locationId: id,
                status: (0, typeorm_2.In)([
                    order_status_enum_1.OrderStatus.PendingConfirmation,
                    order_status_enum_1.OrderStatus.Confirmed,
                    order_status_enum_1.OrderStatus.InPreparation,
                    order_status_enum_1.OrderStatus.ReadyForDelivery,
                    order_status_enum_1.OrderStatus.ReadyForExternalPickup,
                    order_status_enum_1.OrderStatus.InDelivery,
                ]),
            },
        });
        if (activeOrderCount > 0) {
            throw new common_1.ConflictException(`No se puede deshabilitar la sucursal porque tiene ${activeOrderCount} pedidos activos. Por favor, complete o cancele todos los pedidos antes de deshabilitarla.`);
        }
        const result = await this.locationRepository.softDelete({ id, tenantId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Sucursal con ID "${id}" no encontrada.`);
        }
    }
    async enable(id, tenantId) {
        await this.locationRepository.restore({ id, tenantId });
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], LocationsService);
//# sourceMappingURL=locations.service.js.map