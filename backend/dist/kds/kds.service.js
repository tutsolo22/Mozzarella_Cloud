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
exports.KdsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const order_status_enum_1 = require("../orders/enums/order-status.enum");
let KdsService = class KdsService {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async findOrders(tenantId, locationId, zoneId) {
        const statuses = [
            order_status_enum_1.OrderStatus.PendingConfirmation,
            order_status_enum_1.OrderStatus.InPreparation,
            order_status_enum_1.OrderStatus.ReadyForExternalPickup,
        ];
        const query = this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'item')
            .leftJoinAndSelect('item.product', 'product')
            .leftJoinAndSelect('product.preparationZone', 'preparationZone')
            .leftJoinAndSelect('order.customer', 'customer')
            .where('order.tenantId = :tenantId', { tenantId })
            .andWhere('order.locationId = :locationId', { locationId })
            .andWhere('order.status IN (:...statuses)', { statuses })
            .orderBy('order.createdAt', 'ASC');
        if (zoneId) {
            query.andWhere('product.preparationZoneId = :zoneId', { zoneId });
        }
        return query.getMany();
    }
};
exports.KdsService = KdsService;
exports.KdsService = KdsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], KdsService);
//# sourceMappingURL=kds.service.js.map