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
exports.FinancialsController = void 0;
const common_1 = require("@nestjs/common");
const financials_service_1 = require("./financials.service");
const create_overhead_cost_dto_1 = require("./dto/create-overhead-cost.dto");
const update_overhead_cost_dto_1 = require("./dto/update-overhead-cost.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../roles/enums/role.enum");
const user_decorator_1 = require("../auth/decorators/user.decorator");
let FinancialsController = class FinancialsController {
    constructor(financialsService) {
        this.financialsService = financialsService;
    }
    create(createDto, user) {
        if (!user.locationId) {
            throw new common_1.ForbiddenException('No tienes una sucursal asignada para registrar costos.');
        }
        return this.financialsService.create(createDto, user.tenantId, user.locationId);
    }
    findAll(user, startDate, endDate, locationId) {
        let effectiveLocationId = locationId;
        if (user.role === role_enum_1.RoleEnum.Admin) {
        }
        else {
            if (!user.locationId) {
                throw new common_1.ForbiddenException('No tienes una sucursal asignada.');
            }
            if (locationId && locationId !== user.locationId) {
                throw new common_1.ForbiddenException('No tienes permiso para ver los costos de otra sucursal.');
            }
            effectiveLocationId = user.locationId;
        }
        return this.financialsService.findAll(user.tenantId, startDate, endDate, effectiveLocationId);
    }
    update(id, updateDto, user) {
        const locationId = user.role === role_enum_1.RoleEnum.Manager ? user.locationId : undefined;
        if (user.role === role_enum_1.RoleEnum.Manager && !locationId) {
            throw new common_1.ForbiddenException('No tienes una sucursal asignada.');
        }
        return this.financialsService.update(id, updateDto, user.tenantId, locationId);
    }
    remove(id, user) {
        const locationId = user.role === role_enum_1.RoleEnum.Manager ? user.locationId : undefined;
        if (user.role === role_enum_1.RoleEnum.Manager && !locationId) {
            throw new common_1.ForbiddenException('No tienes una sucursal asignada.');
        }
        return this.financialsService.remove(id, user.tenantId, locationId);
    }
};
exports.FinancialsController = FinancialsController;
__decorate([
    (0, common_1.Post)('overhead-costs'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_overhead_cost_dto_1.CreateOverheadCostDto, Object]),
    __metadata("design:returntype", void 0)
], FinancialsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('overhead-costs'),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('locationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], FinancialsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)('overhead-costs/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_overhead_cost_dto_1.UpdateOverheadCostDto, Object]),
    __metadata("design:returntype", void 0)
], FinancialsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('overhead-costs/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FinancialsController.prototype, "remove", null);
exports.FinancialsController = FinancialsController = __decorate([
    (0, common_1.Controller)('financials'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager),
    __metadata("design:paramtypes", [financials_service_1.FinancialsService])
], FinancialsController);
//# sourceMappingURL=financials.controller.js.map