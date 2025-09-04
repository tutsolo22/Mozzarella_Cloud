"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const delivery_controller_1 = require("./delivery.controller");
const route_optimization_service_1 = require("./services/route-optimization.service");
const users_module_1 = require("../users/users.module");
const orders_module_1 = require("../orders/orders.module");
const tenants_module_1 = require("../tenants/tenants.module");
let DeliveryModule = class DeliveryModule {
};
exports.DeliveryModule = DeliveryModule;
exports.DeliveryModule = DeliveryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            orders_module_1.OrdersModule,
            tenants_module_1.TenantsModule,
            axios_1.HttpModule,
        ],
        controllers: [delivery_controller_1.DeliveryController],
        providers: [route_optimization_service_1.RouteOptimizationService],
    })
], DeliveryModule);
//# sourceMappingURL=delivery.module.js.map