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
exports.PreparationZonesController = void 0;
const common_1 = require("@nestjs/common");
const preparation_zones_service_1 = require("./preparation-zones.service");
const create_preparation_zone_dto_1 = require("./dto/create-preparation-zone.dto");
const update_preparation_zone_dto_1 = require("./dto/update-preparation-zone.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../roles/enums/role.enum");
const user_decorator_1 = require("../auth/decorators/user.decorator");
let PreparationZonesController = class PreparationZonesController {
    constructor(zonesService) {
        this.zonesService = zonesService;
    }
    create(createDto, user) {
        if (!user.locationId)
            throw new common_1.ForbiddenException('No tienes una sucursal asignada.');
        return this.zonesService.create(createDto, user.tenantId, user.locationId);
    }
    findAll(user) {
        if (!user.locationId)
            throw new common_1.ForbiddenException('No tienes una sucursal asignada.');
        return this.zonesService.findAll(user.tenantId, user.locationId);
    }
    findOne(id, user) {
        if (!user.locationId)
            throw new common_1.ForbiddenException('No tienes una sucursal asignada.');
        return this.zonesService.findOne(id, user.tenantId, user.locationId);
    }
    update(id, updateDto, user) {
        if (!user.locationId)
            throw new common_1.ForbiddenException('No tienes una sucursal asignada.');
        return this.zonesService.update(id, updateDto, user.tenantId, user.locationId);
    }
    remove(id, user) {
        if (!user.locationId)
            throw new common_1.ForbiddenException('No tienes una sucursal asignada.');
        return this.zonesService.remove(id, user.tenantId, user.locationId);
    }
};
exports.PreparationZonesController = PreparationZonesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_preparation_zone_dto_1.CreatePreparationZoneDto, Object]),
    __metadata("design:returntype", void 0)
], PreparationZonesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PreparationZonesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PreparationZonesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_preparation_zone_dto_1.UpdatePreparationZoneDto, Object]),
    __metadata("design:returntype", void 0)
], PreparationZonesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PreparationZonesController.prototype, "remove", null);
exports.PreparationZonesController = PreparationZonesController = __decorate([
    (0, common_1.Controller)('preparation-zones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager),
    __metadata("design:paramtypes", [preparation_zones_service_1.PreparationZonesService])
], PreparationZonesController);
//# sourceMappingURL=preparation-zones.controller.js.map