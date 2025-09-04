"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeocodingModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const geocoding_service_1 = require("./geocoding.service");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const tenant_configuration_entity_1 = require("../tenants/entities/tenant-configuration.entity");
let GeocodingModule = class GeocodingModule {
};
exports.GeocodingModule = GeocodingModule;
exports.GeocodingModule = GeocodingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant, tenant_configuration_entity_1.TenantConfiguration]),
        ],
        providers: [geocoding_service_1.GeocodingService],
        exports: [geocoding_service_1.GeocodingService],
    })
], GeocodingModule);
//# sourceMappingURL=geocoding.module.js.map