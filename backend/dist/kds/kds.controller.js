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
exports.KdsController = void 0;
const common_1 = require("@nestjs/common");
const kds_service_1 = require("./kds.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../roles/enums/role.enum");
const user_decorator_1 = require("../auth/decorators/user.decorator");
let KdsController = class KdsController {
    constructor(kdsService) {
        this.kdsService = kdsService;
    }
    getActiveOrdersForZone(user, zoneId) {
        if (!user.locationId) {
            throw new common_1.ForbiddenException('No tienes una sucursal asignada para ver el KDS.');
        }
        return this.kdsService.getActiveOrdersForZone(user.tenantId, user.locationId, zoneId);
    }
};
exports.KdsController = KdsController;
__decorate([
    (0, common_1.Get)('orders/:zoneId'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager, role_enum_1.RoleEnum.Kitchen),
    __param(0, (0, user_decorator_1.User)()),
    __param(1, (0, common_1.Param)('zoneId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], KdsController.prototype, "getActiveOrdersForZone", null);
exports.KdsController = KdsController = __decorate([
    (0, common_1.Controller)('kds'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [kds_service_1.KdsService])
], KdsController);
//# sourceMappingURL=kds.controller.js.map