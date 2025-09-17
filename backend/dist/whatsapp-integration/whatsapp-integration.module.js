"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappIntegrationModule = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_integration_service_1 = require("./whatsapp-integration.service");
const whatsapp_integration_controller_1 = require("./whatsapp-integration.controller");
const tenants_module_1 = require("../tenants/tenants.module");
const customers_module_1 = require("../customers/customers.module");
const orders_module_1 = require("../orders/orders.module");
const products_module_1 = require("../products/products.module");
const payments_module_1 = require("../payments/payments.module");
let WhatsappIntegrationModule = class WhatsappIntegrationModule {
};
exports.WhatsappIntegrationModule = WhatsappIntegrationModule;
exports.WhatsappIntegrationModule = WhatsappIntegrationModule = __decorate([
    (0, common_1.Module)({
        imports: [tenants_module_1.TenantsModule, customers_module_1.CustomersModule, orders_module_1.OrdersModule, products_module_1.ProductsModule, payments_module_1.PaymentsModule],
        providers: [whatsapp_integration_service_1.WhatsappIntegrationService],
        controllers: [whatsapp_integration_controller_1.WhatsappIntegrationController],
    })
], WhatsappIntegrationModule);
//# sourceMappingURL=whatsapp-integration.module.js.map