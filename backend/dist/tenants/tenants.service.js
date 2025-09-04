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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const tenant_entity_1 = require("./entities/tenant.entity");
const tenant_status_enum_1 = require("./enums/tenant-status.enum");
const users_service_1 = require("../users/users.service");
const licensing_service_1 = require("../licenses/licensing.service");
const tenant_configuration_entity_1 = require("./entities/tenant-configuration.entity");
const role_entity_1 = require("../roles/entities/role.entity");
const role_enum_1 = require("../roles/enums/role.enum");
let TenantsService = class TenantsService {
    constructor(tenantRepository, roleRepository, usersService, licensingService) {
        this.tenantRepository = tenantRepository;
        this.roleRepository = roleRepository;
        this.usersService = usersService;
        this.licensingService = licensingService;
    }
    async create(createTenantDto) {
        const existingTenant = await this.tenantRepository.findOne({ where: { name: createTenantDto.name } });
        if (existingTenant) {
            throw new common_1.ConflictException('Ya existe un tenant con ese nombre.');
        }
        const newTenant = this.tenantRepository.create({
            name: createTenantDto.name,
            status: tenant_status_enum_1.TenantStatus.Activo,
            configuration: new tenant_configuration_entity_1.TenantConfiguration(),
        });
        const savedTenant = await this.tenantRepository.save(newTenant);
        const adminRole = await this.roleRepository.findOneBy({ name: role_enum_1.RoleEnum.Admin });
        if (!adminRole) {
            throw new common_1.NotFoundException('El rol de "Administrador" no se encuentra en el sistema.');
        }
        await this.usersService.create({
            email: createTenantDto.adminEmail,
            password: createTenantDto.adminPassword,
            fullName: 'Administrador',
            roleId: adminRole.id,
        }, savedTenant.id);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await this.licensingService.generateLicense(savedTenant, 5, 1, expiresAt);
        return this.findOne(savedTenant.id);
    }
    async findOne(id) {
        const tenant = await this.tenantRepository.findOne({ where: { id }, relations: ['license', 'configuration'] });
        if (!tenant)
            throw new common_1.NotFoundException(`Tenant con ID "${id}" no encontrado.`);
        return tenant;
    }
    async getConfiguration(tenantId) {
        const tenant = await this.findOne(tenantId);
        return tenant.configuration;
    }
    async updateConfiguration(tenantId, updateDto) {
        const tenant = await this.findOne(tenantId);
        const newConfig = { ...tenant.configuration, ...updateDto };
        tenant.configuration = newConfig;
        await this.tenantRepository.save(tenant);
        return newConfig;
    }
    findByApiKey(apiKey) {
        return this.tenantRepository.findOneBy({ whatsappApiKey: apiKey });
    }
    async regenerateWhatsappApiKey(tenantId) {
        const newApiKey = (0, crypto_1.randomBytes)(32).toString('hex');
        await this.tenantRepository.update(tenantId, { whatsappApiKey: newApiKey });
        return newApiKey;
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService,
        licensing_service_1.LicensingService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map