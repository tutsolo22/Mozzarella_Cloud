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
exports.SmtpController = void 0;
const common_1 = require("@nestjs/common");
const smtp_service_1 = require("./smtp.service");
const smtp_settings_dto_1 = require("./dto/smtp-settings.dto");
const test_smtp_dto_1 = require("./dto/test-smtp.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../roles/enums/role.enum");
let SmtpController = class SmtpController {
    constructor(smtpService) {
        this.smtpService = smtpService;
    }
    getSmtpSettings() {
        return this.smtpService.getSmtpSettings();
    }
    async saveSmtpSettings(smtpSettings) {
        await this.smtpService.saveSmtpSettings(smtpSettings);
    }
    testSmtpConnection(smtpSettings) {
        return this.smtpService.testSmtpConnection(smtpSettings);
    }
    sendTestEmailWithUnsavedSettings(testSmtpDto) {
        return this.smtpService.sendTestEmailWithUnsavedSettings(testSmtpDto);
    }
    sendConfiguredTestEmail(email) {
        return this.smtpService.sendConfiguredTestEmail(email);
    }
};
exports.SmtpController = SmtpController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SmtpController.prototype, "getSmtpSettings", null);
__decorate([
    (0, common_1.Put)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [smtp_settings_dto_1.SmtpSettingsDto]),
    __metadata("design:returntype", Promise)
], SmtpController.prototype, "saveSmtpSettings", null);
__decorate([
    (0, common_1.Post)('test-connection'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [smtp_settings_dto_1.SmtpSettingsDto]),
    __metadata("design:returntype", Promise)
], SmtpController.prototype, "testSmtpConnection", null);
__decorate([
    (0, common_1.Post)('send-form-test-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [test_smtp_dto_1.TestSmtpDto]),
    __metadata("design:returntype", Promise)
], SmtpController.prototype, "sendTestEmailWithUnsavedSettings", null);
__decorate([
    (0, common_1.Post)('send-test-email'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SmtpController.prototype, "sendConfiguredTestEmail", null);
exports.SmtpController = SmtpController = __decorate([
    (0, common_1.Controller)('settings/smtp'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.SuperAdmin),
    __metadata("design:paramtypes", [smtp_service_1.SmtpService])
], SmtpController);
//# sourceMappingURL=smtp.controller.js.map