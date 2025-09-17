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
exports.LicenseValidationService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const license_entity_1 = require("../licenses/entities/license.entity");
let LicenseValidationService = class LicenseValidationService {
    constructor(licenseRepository, jwtService) {
        this.licenseRepository = licenseRepository;
        this.jwtService = jwtService;
    }
    async validate(licenseKey, localTenantId) {
        let payload;
        try {
            payload = this.jwtService.verify(licenseKey);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('La clave de licencia no es válida o ha expirado.');
        }
        const license = await this.licenseRepository.findOne({
            where: { key: licenseKey },
            relations: ['tenant'],
        });
        if (!license) {
            throw new common_1.NotFoundException('La clave de licencia no existe en nuestros registros.');
        }
        if (license.status === license_entity_1.LicenseStatus.Revoked) {
            throw new common_1.UnauthorizedException('Esta licencia ha sido revocada.');
        }
        if (!license.tenant) {
            throw new common_1.UnauthorizedException('La licencia no está asociada a ningún tenant. Contacte a soporte.');
        }
        if (localTenantId && license.tenant.id !== localTenantId) {
            throw new common_1.UnauthorizedException('Esta licencia no pertenece a este tenant.');
        }
        if (license.tenant.id !== payload.tenantId) {
            throw new common_1.UnauthorizedException('Inconsistencia en la licencia. Contacte a soporte.');
        }
        return {
            isValid: true,
            status: license.status,
            tenantId: license.tenant.id,
            userLimit: license.userLimit,
            branchLimit: license.branchLimit,
            expiresAt: license.expiresAt,
        };
    }
};
exports.LicenseValidationService = LicenseValidationService;
exports.LicenseValidationService = LicenseValidationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(license_entity_1.License)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], LicenseValidationService);
//# sourceMappingURL=license-validation.service.js.map