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
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("../orders/orders.service");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    constructor(ordersService) {
        this.ordersService = ordersService;
        this.logger = new common_1.Logger(WebhooksService_1.name);
    }
    async processInvoicingWebhook(tenantId, payload) {
        this.logger.log(`Procesando webhook de facturación para tenant ${tenantId}, orden externa ${payload.externalOrderId}`);
        try {
            const order = await this.ordersService.findOne(payload.internalOrderId, tenantId, undefined);
            if (payload.status === 'invoiced') {
                await this.ordersService.update(order.id, { isBilled: true, invoiceUrl: payload.invoiceUrl }, tenantId, order.locationId);
                this.logger.log(`Orden ${order.shortId} (ID: ${order.id}) marcada como facturada. URL: ${payload.invoiceUrl}`);
            }
            else {
                this.logger.log(`Webhook de facturación recibido con estado '${payload.status}' para la orden ${order.shortId}. No se requiere acción.`);
            }
        }
        catch (error) {
            this.logger.warn(`Webhook recibido para una orden no encontrada o no perteneciente al tenant. OrderID: ${payload.internalOrderId}, TenantID: ${tenantId}`);
        }
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map