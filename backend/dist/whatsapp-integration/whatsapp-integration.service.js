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
exports.WhatsappIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const customers_service_1 = require("../customers/customers.service");
const orders_service_1 = require("../orders/orders.service");
const payments_service_1 = require("../payments/payments.service");
const order_types_enum_1 = require("../orders/enums/order-types.enum");
const order_status_enum_1 = require("../orders/enums/order-status.enum");
const order_channel_enum_1 = require("../orders/enums/order-channel.enum");
let WhatsappIntegrationService = class WhatsappIntegrationService {
    constructor(customersService, ordersService, paymentsService) {
        this.customersService = customersService;
        this.ordersService = ordersService;
        this.paymentsService = paymentsService;
    }
    async processIncomingOrder(tenant, orderDto) {
        if (!tenant.configuration.enabledPaymentMethods.includes(orderDto.paymentMethod)) {
            throw new common_1.BadRequestException(`El método de pago '${orderDto.paymentMethod}' no está habilitado para este negocio.`);
        }
        const customer = await this.customersService.findOrCreateByPhone({
            phoneNumber: orderDto.customerPhone,
            fullName: orderDto.customerName,
        }, tenant.id);
        const isOnlinePayment = orderDto.paymentMethod === order_types_enum_1.PaymentMethod.MercadoPago;
        const createdOrder = await this.ordersService.create({
            customerId: customer.id,
            orderType: orderDto.orderType,
            paymentMethod: orderDto.paymentMethod,
            deliveryAddress: orderDto.deliveryAddress,
            items: orderDto.items,
            channel: order_channel_enum_1.OrderChannel.WHATSAPP,
        }, tenant.id, orderDto.locationId, undefined, isOnlinePayment ? order_status_enum_1.OrderStatus.PendingPayment : order_status_enum_1.OrderStatus.Confirmed);
        if (isOnlinePayment) {
            const paymentInfo = await this.paymentsService.createMercadoPagoPreference(tenant, createdOrder);
            await this.ordersService.update(createdOrder.id, {
                paymentLink: paymentInfo.init_point,
            }, tenant.id, orderDto.locationId);
            return {
                message: 'Pedido pre-registrado. Por favor, completa el pago para confirmar.',
                paymentLink: paymentInfo.init_point,
                orderId: createdOrder.shortId,
            };
        }
        else {
            return {
                message: 'Pedido confirmado con éxito.',
                orderId: createdOrder.shortId,
                totalAmount: createdOrder.totalAmount,
                estimatedReadyAt: createdOrder.estimatedDeliveryAt,
            };
        }
    }
};
exports.WhatsappIntegrationService = WhatsappIntegrationService;
exports.WhatsappIntegrationService = WhatsappIntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [customers_service_1.CustomersService,
        orders_service_1.OrdersService,
        payments_service_1.PaymentsService])
], WhatsappIntegrationService);
//# sourceMappingURL=whatsapp-integration.service.js.map