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
const tenant_entity_1 = require("./tenant.entity");
let TenantConfiguration = class TenantConfiguration {
};
exports.TenantConfiguration = TenantConfiguration;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => tenant_entity_1.Tenant, tenant => tenant.configuration),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], TenantConfiguration.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "slogan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "contactPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "fiscalAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "logoDarkUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "faviconUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 13, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "rfc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "businessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "taxRegime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "facebookUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "instagramUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "tiktokUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 45, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "primaryPrinterIp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 45, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "secondaryPrinterIp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "kdsNotificationSoundUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'double precision', nullable: true }),
    __metadata("design:type", Number)
], TenantConfiguration.prototype, "restaurantLatitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'double precision', nullable: true }),
    __metadata("design:type", Number)
], TenantConfiguration.prototype, "restaurantLongitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, comment: 'API Key for route optimization services' }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "directionsApiKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, comment: 'API Key for geocoding services' }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "openCageApiKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, comment: 'Access Token for Mercado Pago' }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "mercadoPagoAccessToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true, comment: 'List of enabled payment methods' }),
    __metadata("design:type", Array)
], TenantConfiguration.prototype, "enabledPaymentMethods", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'geography', spatialFeatureType: 'Polygon', srid: 4326, nullable: true, comment: 'Área de entrega a nivel de tenant (fallback)' }),
    __metadata("design:type", Object)
], TenantConfiguration.prototype, "deliveryArea", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, nullable: true, comment: 'URL de la aplicación de facturación para que el usuario acceda.' }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "invoicingAppUrl", void 0);
exports.TenantConfiguration = TenantConfiguration = __decorate([
    (0, typeorm_1.Entity)('tenant_configurations')
], TenantConfiguration);
//# sourceMappingURL=tenant-configuration.entity.js.map