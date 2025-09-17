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
var SuperAdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const users_service_1 = require("../users/users.service");
const role_enum_1 = require("../roles/enums/role.enum");
const role_entity_1 = require("../roles/entities/role.entity");
const user_entity_1 = require("../users/entities/user.entity");
const license_entity_1 = require("../licenses/entities/license.entity");
const product_entity_1 = require("../products/entities/product.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const location_entity_1 = require("../locations/entities/location.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const ingredient_entity_1 = require("../ingredients/entities/ingredient.entity");
const product_category_entity_1 = require("../products/entities/product-category.entity");
const tenant_configuration_entity_1 = require("../tenants/entities/tenant-configuration.entity");
const licensing_service_1 = require("../licenses/licensing.service");
const auth_service_1 = require("../auth/auth.service");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
let SuperAdminService = SuperAdminService_1 = class SuperAdminService {
    constructor(tenantRepository, roleRepository, usersService, licensesService, authService, dataSource) {
        this.tenantRepository = tenantRepository;
        this.roleRepository = roleRepository;
        this.usersService = usersService;
        this.licensesService = licensesService;
        this.authService = authService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(SuperAdminService_1.name);
    }
    async findAllTenants() {
        return this.tenantRepository.find({
            relations: ['users', 'users.role', 'license'],
            order: { createdAt: 'DESC' },
        });
    }
    async create(createTenantDto) {
        const { name, adminEmail, adminFullName } = createTenantDto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const existingTenant = await queryRunner.manager.findOneBy(tenant_entity_1.Tenant, { name });
            if (existingTenant) {
                throw new common_1.ConflictException(`El tenant con el nombre "${name}" ya existe.`);
            }
            const existingUser = await queryRunner.manager.findOneBy(user_entity_1.User, { email: adminEmail });
            if (existingUser) {
                throw new common_1.ConflictException(`El email de administrador "${adminEmail}" ya está en uso.`);
            }
            const tenant = queryRunner.manager.create(tenant_entity_1.Tenant, { name });
            await queryRunner.manager.save(tenant);
            const adminRole = await queryRunner.manager.findOneBy(role_entity_1.Role, { name: role_enum_1.RoleEnum.Admin });
            if (!adminRole) {
                throw new common_1.InternalServerErrorException('El rol de Administrador base no existe.');
            }
            const temporaryPassword = crypto.randomBytes(20).toString('hex');
            const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
            const adminUser = queryRunner.manager.create(user_entity_1.User, {
                email: adminEmail,
                fullName: adminFullName,
                password: hashedPassword,
                role: adminRole,
                tenant: tenant,
                status: user_entity_1.UserStatus.PendingVerification,
            });
            await queryRunner.manager.save(adminUser);
            await queryRunner.commitTransaction();
            await this.authService.resendInvitation(adminUser.id);
            return tenant;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Error al crear el tenant: ${error}`);
            if (error instanceof common_1.ConflictException || error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Ocurrió un error al crear el tenant.');
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateTenant(id, updateTenantDto) {
        const tenant = await this.tenantRepository.preload({
            id,
            ...updateTenantDto,
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant con ID #${id} no encontrado.`);
        }
        return this.tenantRepository.save(tenant);
    }
    async updateTenantStatus(id, status) {
        const tenant = await this.tenantRepository.findOneBy({ id });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant con ID #${id} no encontrado.`);
        }
        tenant.status = status;
        return this.tenantRepository.save(tenant);
    }
    async resendInvitation(userId) {
        return this.authService.resendInvitation(userId);
    }
    async deleteTenant(tenantId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const tenant = await queryRunner.manager.findOneBy(tenant_entity_1.Tenant, { id: tenantId });
            if (!tenant) {
                throw new common_1.NotFoundException(`Tenant con ID #${tenantId} no encontrado.`);
            }
            const orderItemTableExists = await queryRunner.query("SELECT to_regclass('public.order_item')");
            if (orderItemTableExists[0].to_regclass) {
                await queryRunner.query('DELETE FROM "order_item" WHERE "orderId" IN (SELECT id FROM "order" WHERE "tenantId" = $1)', [tenantId]);
            }
            else {
                this.logger.warn('Table "order_item" not found, skipping cleanup. This is expected for new tenants.');
            }
            const recipeItemTableExists = await queryRunner.query("SELECT to_regclass('public.recipe_item')");
            if (recipeItemTableExists[0].to_regclass) {
                await queryRunner.query('DELETE FROM "recipe_item" WHERE "productId" IN (SELECT id FROM "product" WHERE "tenantId" = $1)', [tenantId]);
            }
            else {
                this.logger.warn('Table "recipe_item" not found, skipping cleanup. This is expected for new tenants.');
            }
            await queryRunner.manager.delete(order_entity_1.Order, { tenantId });
            await queryRunner.manager.delete(product_entity_1.Product, { tenantId });
            await queryRunner.manager.delete(user_entity_1.User, { tenantId });
            await queryRunner.manager.delete(tenant_configuration_entity_1.TenantConfiguration, { tenantId });
            await queryRunner.manager.delete(location_entity_1.Location, { tenantId });
            await queryRunner.manager.delete(customer_entity_1.Customer, { tenantId });
            await queryRunner.manager.delete(ingredient_entity_1.Ingredient, { tenantId });
            await queryRunner.manager.delete(product_category_entity_1.ProductCategory, { tenantId });
            const license = await queryRunner.manager.findOne(license_entity_1.License, { where: { tenant: { id: tenantId } } });
            if (license) {
                await queryRunner.manager.remove(license);
            }
            await queryRunner.manager.remove(tenant);
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Error al eliminar el tenant ${tenantId}:`, error);
            if (error.message.includes('transaction is aborted')) {
                throw new common_1.InternalServerErrorException('La transacción fue abortada debido a un error inesperado. Revisa los logs del servidor para más detalles.');
            }
            throw new common_1.InternalServerErrorException('Ocurrió un error al eliminar el tenant. Es posible que aún existan datos asociados. Revisa los logs del servidor para más detalles.');
        }
        finally {
            await queryRunner.release();
        }
    }
    async generateTenantLicense(tenantId, generateLicenseDto) {
        const { userLimit, branchLimit, durationInDays } = generateLicenseDto;
        const tenant = await this.tenantRepository.findOne({ where: { id: tenantId }, relations: ['license'] });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant con ID "${tenantId}" no encontrado.`);
        }
        if (tenant.license) {
            await this.licensesService.revokeLicense(tenantId);
        }
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationInDays);
        return this.licensesService.generateLicense(tenant, userLimit, branchLimit, expiresAt);
    }
    async revokeTenantLicense(tenantId) {
        const tenant = await this.tenantRepository.findOneBy({ id: tenantId });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant con ID "${tenantId}" no encontrado.`);
        }
        await this.licensesService.revokeLicense(tenantId);
        return { message: 'Licencia revocada con éxito.' };
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = SuperAdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService,
        licensing_service_1.LicensingService,
        auth_service_1.AuthService,
        typeorm_2.DataSource])
], SuperAdminService);
//# sourceMappingURL=super-admin.service.js.map