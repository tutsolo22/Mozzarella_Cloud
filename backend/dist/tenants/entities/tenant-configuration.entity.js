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
exports.TenantConfiguration = void 0;
const typeorm_1 = require("typeorm");
let TenantConfiguration = class TenantConfiguration {
};
exports.TenantConfiguration = TenantConfiguration;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', unique: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'API Key for OpenRouteService (Directions)',
    }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "directionsApiKey", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'double precision',
        nullable: true,
        comment: 'Latitud de la ubicación base del restaurante',
    }),
    __metadata("design:type", Number)
], TenantConfiguration.prototype, "restaurantLatitude", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'double precision',
        nullable: true,
        comment: 'Longitud de la ubicación base del restaurante',
    }),
    __metadata("design:type", Number)
], TenantConfiguration.prototype, "restaurantLongitude", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'API Key for OpenCage (Geocoding)',
    }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "openCageApiKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "mercadoPagoAccessToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-array',
        nullable: true,
        comment: 'Payment methods enabled for this tenant (e.g., cash, mercado_pago)',
        default: 'cash',
    }),
    __metadata("design:type", Array)
], TenantConfiguration.prototype, "enabledPaymentMethods", void 0);
exports.TenantConfiguration = TenantConfiguration = __decorate([
    (0, typeorm_1.Entity)('tenant_configurations')
], TenantConfiguration);
//# sourceMappingURL=tenant-configuration.entity.js.map