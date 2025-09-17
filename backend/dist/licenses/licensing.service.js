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
exports.LicensingService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const license_entity_1 = require("./entities/license.entity");
let LicensingService = class LicensingService {
    constructor(licenseRepository, jwtService) {
        this.licenseRepository = licenseRepository;
        this.jwtService = jwtService;
    }
    async generateLicense(tenant, userLimit, branchLimit, expiresAt, queryRunner) {
        const manager = queryRunner ? queryRunner.manager : this.licenseRepository.manager;
        const payload = {
            tenantId: tenant.id,
            userLimit,
            branchLimit,
            exp: Math.floor(expiresAt.getTime() / 1000),
        };
        const licenseKey = this.jwtService.sign(payload);
        const newLicense = manager.create(license_entity_1.License, {
            key: licenseKey,
            tenant,
            userLimit,
            branchLimit,
            expiresAt,
            status: license_entity_1.LicenseStatus.Active,
        });
        await manager.save(newLicense);
        return newLicense;
    }
    async revokeLicense(tenantId) {
        const license = await this.licenseRepository.findOne({ where: { tenant: { id: tenantId } } });
        if (!license) {
            throw new common_1.NotFoundException(`No se encontró una licencia para el tenant con ID "${tenantId}".`);
        }
        license.status = license_entity_1.LicenseStatus.Revoked;
        return this.licenseRepository.save(license);
    }
};
exports.LicensingService = LicensingService;
exports.LicensingService = LicensingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(license_entity_1.License)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], LicensingService);
//# sourceMappingURL=licensing.service.js.map