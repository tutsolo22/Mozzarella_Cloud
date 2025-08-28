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
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const licensing_service_1 = require("../licenses/licensing.service");
let SuperAdminService = class SuperAdminService {
    constructor(tenantRepository, licensingService) {
        this.tenantRepository = tenantRepository;
        this.licensingService = licensingService;
    }
    async findAllTenants() {
        return this.tenantRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['license'],
        });
    }
    async updateTenantStatus(id, status) {
        const tenant = await this.tenantRepository.findOneBy({ id });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant con ID "${id}" no encontrado`);
        }
        tenant.status = status;
        return this.tenantRepository.save(tenant);
    }
    async createLicenseForTenant(tenantId, createLicenseDto) {
        const tenant = await this.tenantRepository.findOneBy({ id: tenantId });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant con ID "${tenantId}" no encontrado`);
        }
        const { userLimit, branchLimit, durationInDays } = createLicenseDto;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationInDays);
        return this.licensingService.generateLicense(tenant, userLimit, branchLimit, expiresAt);
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        licensing_service_1.LicensingService])
], SuperAdminService);
//# sourceMappingURL=super-admin.service.js.map