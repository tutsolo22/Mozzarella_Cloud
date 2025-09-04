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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const mercadopago_1 = require("mercadopago");
const tenants_service_1 = require("../tenants/tenants.service");
const orders_service_1 = require("../orders/orders.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(tenantsService, ordersService) {
        this.tenantsService = tenantsService;
        this.ordersService = ordersService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async createMercadoPagoPreference(tenant, order) {
        if (!tenant.configuration.mercadoPagoAccessToken) {
            throw new common_1.InternalServerErrorException('Mercado Pago no está configurado para este negocio.');
        }
        if (!tenant.whatsappApiKey) {
            throw new common_1.InternalServerErrorException('La clave de API para webhooks no está configurada.');
        }
        const client = new mercadopago_1.MercadoPagoConfig({
            accessToken: tenant.configuration.mercadoPagoAccessToken,
        });
        const preference = new mercadopago_1.Preference(client);
        const notification_url = `${process.env.BACKEND_URL}/payments/mercado-pago/webhook?apiKey=${tenant.whatsappApiKey}`;
        this.logger.log(`Generated Notification URL: ${notification_url}`);
        try {
            const result = await preference.create({
                body: {
                    items: order.items.map(item => ({
                        id: item.product.id,
                        title: item.product.name,
                        description: item.notes,
                        quantity: item.quantity,
                        unit_price: Number(item.unitPrice),
                        currency_id: 'MXN',
                    })),
                    back_urls: {
                        success: `${process.env.FRONTEND_URL}/order/${order.shortId}/success`,
                        failure: `${process.env.FRONTEND_URL}/order/${order.shortId}/failure`,
                    },
                    notification_url,
                    external_reference: order.id,
                },
            });
            return { preferenceId: result.id, init_point: result.init_point };
        }
        catch (error) {
            this.logger.error('Error creating Mercado Pago preference:', error.cause ?? error);
            throw new common_1.InternalServerErrorException('No se pudo crear el link de pago.');
        }
    }
    async handleWebhook(paymentId, tenantId) {
        const tenant = await this.tenantsService.findOne(tenantId);
        const client = new mercadopago_1.MercadoPagoConfig({ accessToken: tenant.configuration.mercadoPagoAccessToken });
        const payment = new mercadopago_1.Payment(client);
        const paymentInfo = await payment.get({ id: paymentId });
        this.logger.log(`Verifying payment for order ID: ${paymentInfo.external_reference}`);
        if (paymentInfo.status === 'approved') {
            const orderId = paymentInfo.external_reference;
            await this.ordersService.confirmOrderPayment(orderId, paymentId);
            this.logger.log(`Payment for order ${orderId} approved and confirmed.`);
        }
        else {
            this.logger.warn(`Payment ${paymentId} for order ${paymentInfo.external_reference} is not approved. Status: ${paymentInfo.status}`);
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => orders_service_1.OrdersService))),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService,
        orders_service_1.OrdersService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map