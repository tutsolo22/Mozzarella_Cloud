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
const location_entity_1 = require("../locations/entities/location.entity");
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
        try {
            const { tenant, adminUser } = await this.dataSource.transaction(async (transactionalEntityManager) => {
                const existingTenant = await transactionalEntityManager.findOneBy(tenant_entity_1.Tenant, { name });
                if (existingTenant) {
                    throw new common_1.ConflictException(`El tenant con el nombre "${name}" ya existe.`);
                }
                const existingUser = await transactionalEntityManager.findOneBy(user_entity_1.User, { email: adminEmail });
                if (existingUser) {
                    throw new common_1.ConflictException(`El email de administrador "${adminEmail}" ya está en uso.`);
                }
                const tenant = transactionalEntityManager.create(tenant_entity_1.Tenant, {
                    name,
                    status: tenant_entity_1.TenantStatus.Inactive,
                    plan: null,
                });
                await transactionalEntityManager.save(tenant);
                const defaultLocation = transactionalEntityManager.create(location_entity_1.Location, {
                    name: 'Sucursal Principal',
                    address: 'Dirección por definir',
                    tenantId: tenant.id,
                    isActive: true,
                });
                await transactionalEntityManager.save(defaultLocation);
                const adminRole = await transactionalEntityManager.findOneBy(role_entity_1.Role, { name: role_enum_1.RoleEnum.Admin });
                if (!adminRole) {
                    throw new common_1.InternalServerErrorException('El rol de Administrador base no existe.');
                }
                const temporaryPassword = crypto.randomBytes(20).toString('hex');
                const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
                const adminUser = transactionalEntityManager.create(user_entity_1.User, {
                    email: adminEmail,
                    fullName: adminFullName,
                    password: hashedPassword,
                    roleId: adminRole.id,
                    tenantId: tenant.id,
                    locationId: defaultLocation.id,
                    status: user_entity_1.UserStatus.PendingVerification,
                });
                await transactionalEntityManager.save(adminUser);
                return { tenant, adminUser };
            });
            await this.authService.resendInvitation(adminUser.id);
            return tenant;
        }
        catch (error) {
            this.logger.error(`Error al crear el tenant: ${error.message}`, error.stack);
            if (error.message.includes('Fallo al enviar el correo')) {
                throw error instanceof common_1.InternalServerErrorException ? error : new common_1.InternalServerErrorException(error.message);
            }
            if (error instanceof common_1.ConflictException || error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Ocurrió un error al crear el tenant.');
        }
    }
    async createDefaultLocationForTenant(tenantId) {
        const tenant = await this.tenantRepository.findOneBy({ id: tenantId });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant con ID #${tenantId} no encontrado.`);
        }
        const existingDefaultLocation = await this.dataSource.getRepository(location_entity_1.Location).findOneBy({
            tenantId: tenantId,
            name: 'Sucursal Principal',
        });
        if (existingDefaultLocation) {
            throw new common_1.ConflictException(`El tenant "${tenant.name}" ya tiene una "Sucursal Principal".`);
        }
        const defaultLocation = this.dataSource.getRepository(location_entity_1.Location).create({
            name: 'Sucursal Principal',
            address: 'Dirección por definir',
            tenantId: tenant.id,
            isActive: true,
        });
        this.logger.log(`Creada "Sucursal Principal" para el tenant ${tenant.name} (ID: ${tenant.id})`);
        return this.dataSource.getRepository(location_entity_1.Location).save(defaultLocation);
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
    async deleteTenant(tenantId) {
        try {
            await this.dataSource.transaction(async (transactionalEntityManager) => {
                this.logger.log(`Iniciando borrado transaccional para el tenant ID: ${tenantId}`);
                const tenant = await transactionalEntityManager.findOneBy(tenant_entity_1.Tenant, { id: tenantId });
                if (!tenant) {
                    throw new common_1.NotFoundException(`Tenant con ID #${tenantId} no encontrado.`);
                }
                this.logger.log(`Eliminando dependencias profundas (Order Items, Product Ingredients, etc.)...`);
                const junctionTables = ['order_items', 'product_ingredients', 'inventory_movements'];
                for (const table of junctionTables) {
                    const tableExists = (await transactionalEntityManager.query(`SELECT to_regclass('public."${table}"')`))[0].to_regclass;
                    if (tableExists) {
                        let deleteQuery = '';
                        if (table === 'order_items') {
                            deleteQuery = `DELETE FROM "order_items" WHERE "orderId" IN (SELECT id FROM "orders" WHERE "tenantId" = $1)`;
                        }
                        else if (table === 'product_ingredients') {
                            deleteQuery = `DELETE FROM "product_ingredients" WHERE "productId" IN (SELECT id FROM "products" WHERE "tenantId" = $1)`;
                        }
                        else if (table === 'inventory_movements') {
                            deleteQuery = `DELETE FROM "inventory_movements" WHERE "tenantId" = $1`;
                        }
                        if (deleteQuery)
                            await transactionalEntityManager.query(deleteQuery, [tenantId]);
                    }
                    else {
                        this.logger.warn(`Tabla de unión "${table}" no encontrada, se omite la limpieza.`);
                    }
                }
                const tablesToDelete = [
                    'orders', 'products', 'employees', 'cashier_sessions', 'overhead_costs',
                    'customers', 'ingredients', 'product_categories', 'positions',
                    'preparation_zones', 'locations', 'tenant_configurations', 'licenses'
                ];
                this.logger.log(`Eliminando datos de tablas principales...`);
                for (const table of tablesToDelete) {
                    const tableExists = (await transactionalEntityManager.query(`SELECT to_regclass('public."${table}"')`))[0].to_regclass;
                    if (tableExists) {
                        await transactionalEntityManager.query(`DELETE FROM "${table}" WHERE "tenantId" = $1`, [tenantId]);
                    }
                    else {
                        this.logger.warn(`Tabla principal "${table}" no encontrada, se omite la limpieza.`);
                    }
                }
                this.logger.log(`Eliminando el registro principal del tenant ${tenantId}...`);
                await transactionalEntityManager.remove(tenant);
            });
            this.logger.log(`Tenant ${tenantId} y todos sus datos asociados han sido eliminados.`);
        }
        catch (error) {
            this.logger.error(`Error al eliminar el tenant ${tenantId}: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Ocurrió un error al eliminar el tenant. La operación fue revertida. Revisa los logs del servidor para más detalles.');
        }
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