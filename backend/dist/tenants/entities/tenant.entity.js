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
exports.Tenant = exports.TenantStatus = exports.TenantPlan = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const license_entity_1 = require("../../licenses/entities/license.entity");
const tenant_configuration_entity_1 = require("./tenant-configuration.entity");
const location_entity_1 = require("../../locations/entities/location.entity");
var TenantPlan;
(function (TenantPlan) {
    TenantPlan["Trial"] = "trial";
    TenantPlan["Basic"] = "basic";
    TenantPlan["Premium"] = "premium";
})(TenantPlan || (exports.TenantPlan = TenantPlan = {}));
var TenantStatus;
(function (TenantStatus) {
    TenantStatus["Active"] = "active";
    TenantStatus["Trial"] = "trial";
    TenantStatus["Suspended"] = "suspended";
    TenantStatus["Inactive"] = "inactive";
})(TenantStatus || (exports.TenantStatus = TenantStatus = {}));
let Tenant = class Tenant {
};
exports.Tenant = Tenant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Tenant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TenantStatus,
        default: TenantStatus.Trial,
    }),
    __metadata("design:type", String)
], Tenant.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TenantPlan,
        nullable: true,
    }),
    __metadata("design:type", String)
], Tenant.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "whatsappApiKey", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user.tenant),
    __metadata("design:type", Array)
], Tenant.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => location_entity_1.Location, (location) => location.tenant),
    __metadata("design:type", Array)
], Tenant.prototype, "locations", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => license_entity_1.License, (license) => license.tenant, { cascade: true }),
    __metadata("design:type", license_entity_1.License)
], Tenant.prototype, "license", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => tenant_configuration_entity_1.TenantConfiguration, (config) => config.tenant, {
        cascade: true,
    }),
    __metadata("design:type", tenant_configuration_entity_1.TenantConfiguration)
], Tenant.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Tenant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Tenant.prototype, "updatedAt", void 0);
exports.Tenant = Tenant = __decorate([
    (0, typeorm_1.Entity)()
], Tenant);
//# sourceMappingURL=tenant.entity.js.map