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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantConfigurationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../roles/enums/role.enum");
const user_decorator_1 = require("../auth/decorators/user.decorator");
const tenant_configuration_service_1 = require("./tenant-configuration.service");
const update_tenant_configuration_dto_1 = require("./dto/update-tenant-configuration.dto");
let TenantConfigurationController = class TenantConfigurationController {
    constructor(configService) {
        this.configService = configService;
    }
    getConfiguration(user) {
        return this.configService.getConfiguration(user.tenantId);
    }
    updateConfiguration(user, updateDto) {
        return this.configService.updateConfiguration(user.tenantId, updateDto);
    }
};
exports.TenantConfigurationController = TenantConfigurationController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantConfigurationController.prototype, "getConfiguration", null);
__decorate([
    (0, common_1.Patch)(),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_tenant_configuration_dto_1.UpdateTenantConfigurationDto]),
    __metadata("design:returntype", Promise)
], TenantConfigurationController.prototype, "updateConfiguration", null);
exports.TenantConfigurationController = TenantConfigurationController = __decorate([
    (0, common_1.Controller)('tenant/configuration'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [tenant_configuration_service_1.TenantConfigurationService])
], TenantConfigurationController);
//# sourceMappingURL=tenant-configuration.controller.js.map