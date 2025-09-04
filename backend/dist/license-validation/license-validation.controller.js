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
exports.LicenseValidationController = void 0;
const common_1 = require("@nestjs/common");
const license_validation_service_1 = require("./license-validation.service");
const validate_license_dto_1 = require("./dto/validate-license.dto");
let LicenseValidationController = class LicenseValidationController {
    constructor(licenseValidationService) {
        this.licenseValidationService = licenseValidationService;
    }
    async validateLicense(validateLicenseDto) {
        const { licenseKey, localTenantId } = validateLicenseDto;
        return this.licenseValidationService.validate(licenseKey, localTenantId);
    }
};
exports.LicenseValidationController = LicenseValidationController;
__decorate([
    (0, common_1.Post)('validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validate_license_dto_1.ValidateLicenseDto]),
    __metadata("design:returntype", Promise)
], LicenseValidationController.prototype, "validateLicense", null);
exports.LicenseValidationController = LicenseValidationController = __decorate([
    (0, common_1.Controller)('licenses'),
    __metadata("design:paramtypes", [license_validation_service_1.LicenseValidationService])
], LicenseValidationController);
//# sourceMappingURL=license-validation.controller.js.map