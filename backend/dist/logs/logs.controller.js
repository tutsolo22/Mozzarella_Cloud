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
exports.LogsController = void 0;
const common_1 = require("@nestjs/common");
const logs_service_1 = require("./logs.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../roles/enums/role.enum");
let LogsController = class LogsController {
    constructor(logsService) {
        this.logsService = logsService;
    }
    async getLogFiles() {
        return this.logsService.getLogFiles();
    }
    async getLogs(fileName, lines) {
        if (!fileName) {
            throw new common_1.BadRequestException('El parámetro "file" es requerido.');
        }
        const logContent = await this.logsService.getLogContent(fileName, lines);
        return { log: logContent };
    }
};
exports.LogsController = LogsController;
__decorate([
    (0, common_1.Get)('files'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LogsController.prototype, "getLogFiles", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('file')),
    __param(1, (0, common_1.Query)('lines', new common_1.DefaultValuePipe(200), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], LogsController.prototype, "getLogs", null);
exports.LogsController = LogsController = __decorate([
    (0, common_1.Controller)('super-admin/logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.SuperAdmin),
    __metadata("design:paramtypes", [logs_service_1.LogsService])
], LogsController);
//# sourceMappingURL=logs.controller.js.map