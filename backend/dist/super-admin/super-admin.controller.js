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
exports.SuperAdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../roles/enums/role.enum");
const super_admin_service_1 = require("./super-admin.service");
const update_tenant_status_dto_1 = require("./dto/update-tenant-status.dto");
const create_license_dto_1 = require("./dto/create-license.dto");
let SuperAdminController = class SuperAdminController {
    constructor(superAdminService) {
        this.superAdminService = superAdminService;
    }
    findAllTenants() {
        return this.superAdminService.findAllTenants();
    }
    updateTenantStatus(id, updateTenantStatusDto) {
        return this.superAdminService.updateTenantStatus(id, updateTenantStatusDto.status);
    }
    createLicense(id, createLicenseDto) {
        return this.superAdminService.createLicenseForTenant(id, createLicenseDto);
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Get)('tenants'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.SuperAdmin),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "findAllTenants", null);
__decorate([
    (0, common_1.Patch)('tenants/:id/status'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.SuperAdmin),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tenant_status_dto_1.UpdateTenantStatusDto]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updateTenantStatus", null);
__decorate([
    (0, common_1.Post)('tenants/:id/license'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.SuperAdmin),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_license_dto_1.CreateLicenseDto]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "createLicense", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, common_1.Controller)('super-admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [super_admin_service_1.SuperAdminService])
], SuperAdminController);
//# sourceMappingURL=super-admin.controller.js.map