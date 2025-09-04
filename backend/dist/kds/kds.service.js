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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KdsService = void 0;
const common_1 = require("@nestjs/common");
const order_status_enum_1 = require("../orders/enums/order-status.enum");
const orders_service_1 = require("../orders/orders.service");
let KdsService = class KdsService {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async getActiveOrdersForZone(tenantId, locationId, zoneId) {
        const activeStatuses = [
            order_status_enum_1.OrderStatus.Confirmed,
            order_status_enum_1.OrderStatus.InPreparation,
            order_status_enum_1.OrderStatus.ReadyForExternalPickup,
        ];
        const orders = await this.ordersService.findByStatus(activeStatuses, tenantId, locationId);
        return orders
            .map((order) => {
            order.items = order.items.filter((item) => item.product?.preparationZoneId === zoneId);
            return order;
        })
            .filter((order) => order.items.length > 0);
    }
};
exports.KdsService = KdsService;
exports.KdsService = KdsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], KdsService);
//# sourceMappingURL=kds.service.js.map