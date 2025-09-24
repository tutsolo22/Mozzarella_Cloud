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
    (0, typeorm_1.OneToOne)(() => tenant_entity_1.Tenant, tenant => tenant.configuration, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], TenantConfiguration.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "businessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "legalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 13, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "rfc", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "taxRegime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "taxAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "contactEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 15, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "contactPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 15, nullable: true, comment: 'Teléfono principal del negocio para clientes' }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "businessPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true, comment: 'Número de WhatsApp principal del negocio' }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "businessWhatsapp", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, comment: 'Si es true, cada sucursal puede tener su propio teléfono.' }),
    __metadata("design:type", Boolean)
], TenantConfiguration.prototype, "branchesHaveSeparatePhones", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, comment: 'Si es true, cada sucursal puede tener su propio WhatsApp.' }),
    __metadata("design:type", Boolean)
], TenantConfiguration.prototype, "branchesHaveSeparateWhatsapps", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, comment: 'Si es true, la integración con HexaFact está habilitada.' }),
    __metadata("design:type", Boolean)
], TenantConfiguration.prototype, "isHexaFactIntegrationEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "logoDarkUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "faviconUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "facebook", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "instagram", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], TenantConfiguration.prototype, "tiktok", void 0);
exports.TenantConfiguration = TenantConfiguration = __decorate([
    (0, typeorm_1.Entity)('tenant_configurations')
], TenantConfiguration);
//# sourceMappingURL=tenant-configuration.entity.js.map