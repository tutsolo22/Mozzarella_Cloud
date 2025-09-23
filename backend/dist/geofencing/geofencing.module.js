"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeofencingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const geofencing_service_1 = require("./geofencing.service");
const order_entity_1 = require("../orders/entities/order.entity");
const tenant_configuration_entity_1 = require("../tenant-configuration/entities/tenant-configuration.entity");
const notifications_module_1 = require("../notifications/notifications.module");
let GeofencingModule = class GeofencingModule {
};
exports.GeofencingModule = GeofencingModule;
exports.GeofencingModule = GeofencingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order, tenant_configuration_entity_1.TenantConfiguration]),
            axios_1.HttpModule,
            (0, common_1.forwardRef)(() => notifications_module_1.NotificationsModule),
        ],
        providers: [geofencing_service_1.GeofencingService],
        exports: [geofencing_service_1.GeofencingService],
    })
], GeofencingModule);
//# sourceMappingURL=geofencing.module.js.map