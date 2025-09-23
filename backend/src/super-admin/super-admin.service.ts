import { Injectable, InternalServerErrorException, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Tenant, TenantStatus } from '../tenants/entities/tenant.entity';
import { CreateTenantDto } from '../tenants/dto/create-tenant.dto';
import { UpdateTenantDto } from '../tenants/dto/update-tenant.dto';
import { UsersService } from '../users/users.service';
import { RoleEnum } from '../roles/enums/role.enum';
import { Role } from '../roles/entities/role.entity';
import { User, UserStatus } from '../users/entities/user.entity';
import { License } from '../licenses/entities/license.entity';
import { Location } from '../locations/entities/location.entity';
import { TenantConfiguration } from '../tenant-configuration/entities/tenant-configuration.entity';
import { LicensingService } from '../licenses/licensing.service';
import { GenerateLicenseDto } from '../licenses/dto/generate-license.dto';
import { AuthService } from '../auth/auth.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { ProductCategory } from '../products/entities/product-category.entity';
import { Employee } from '../hr/entities/employee.entity';
import { Position } from '../hr/entities/position.entity';
import { OverheadCost } from '../financials/entities/overhead-cost.entity';
import { CashierSession } from '../reports/entities/cashier-session.entity';
import { PreparationZone } from '../preparation-zones/entities/preparation-zone.entity';

@Injectable()
export class SuperAdminService {
  private readonly logger = new Logger(SuperAdminService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly usersService: UsersService,
    private readonly licensesService: LicensingService,
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
  ) {}

  async findAllTenants(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      relations: ['users', 'users.role', 'license'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const { name, adminEmail, adminFullName } = createTenantDto;

    try {
      // Usamos una transacción para asegurar que todas las operaciones de BD se completen o ninguna.
      const { tenant, adminUser } = await this.dataSource.transaction(async (transactionalEntityManager) => {
        const existingTenant = await transactionalEntityManager.findOneBy(Tenant, { name });
        if (existingTenant) {
          throw new ConflictException(`El tenant con el nombre "${name}" ya existe.`);
        }

        const existingUser = await transactionalEntityManager.findOneBy(User, { email: adminEmail });
        if (existingUser) {
          throw new ConflictException(`El email de administrador "${adminEmail}" ya está en uso.`);
        }

        const tenant = transactionalEntityManager.create(Tenant, {
          name,
          status: TenantStatus.Inactive,
          plan: null,
        });
        await transactionalEntityManager.save(tenant);

        const defaultLocation = transactionalEntityManager.create(Location, {
          name: 'Sucursal Principal',
          address: 'Dirección por definir',
          tenantId: tenant.id,
          isActive: true,
        });
        await transactionalEntityManager.save(defaultLocation);

        const adminRole = await transactionalEntityManager.findOneBy(Role, { name: RoleEnum.Admin });
        if (!adminRole) {
          throw new InternalServerErrorException('El rol de Administrador base no existe.');
        }

        const temporaryPassword = crypto.randomBytes(20).toString('hex');
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        // --- CORRECCIÓN ---
        // Se asignan los IDs directamente para asegurar la correcta creación de las relaciones.
        const adminUser = transactionalEntityManager.create(User, {
          email: adminEmail,
          fullName: adminFullName,
          password: hashedPassword,
          roleId: adminRole.id,
          tenantId: tenant.id,
          locationId: defaultLocation.id,
          status: UserStatus.PendingVerification,
        });
        await transactionalEntityManager.save(adminUser);

        return { tenant, adminUser };
      });

      // Enviar la invitación después de que la transacción sea exitosa
      // Se usa resendInvitation que internamente llama a sendAccountSetupEmail
      await this.authService.resendInvitation(adminUser.id);

      return tenant;
    } catch (error) {
      this.logger.error(`Error al crear el tenant: ${error.message}`, error.stack);

      // Si el error viene del servicio de correo, lo relanzamos para informar al frontend.
      if (error.message.includes('Fallo al enviar el correo')) {
        throw error instanceof InternalServerErrorException ? error : new InternalServerErrorException(error.message);
      }

      if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Ocurrió un error al crear el tenant.');
    }
  }

  async createDefaultLocationForTenant(tenantId: string): Promise<Location> {
    const tenant = await this.tenantRepository.findOneBy({ id: tenantId });
    if (!tenant) {
      throw new NotFoundException(`Tenant con ID #${tenantId} no encontrado.`);
    }

    const existingDefaultLocation = await this.dataSource.getRepository(Location).findOneBy({
      tenantId: tenantId,
      name: 'Sucursal Principal',
    });

    if (existingDefaultLocation) {
      throw new ConflictException(`El tenant "${tenant.name}" ya tiene una "Sucursal Principal".`);
    }

    const defaultLocation = this.dataSource.getRepository(Location).create({
      name: 'Sucursal Principal',
      address: 'Dirección por definir',
      tenantId: tenant.id,
      isActive: true,
    });

    this.logger.log(`Creada "Sucursal Principal" para el tenant ${tenant.name} (ID: ${tenant.id})`);
    return this.dataSource.getRepository(Location).save(defaultLocation);
  }

  async updateTenant(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.tenantRepository.preload({
      id,
      ...updateTenantDto,
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant con ID #${id} no encontrado.`);
    }
    return this.tenantRepository.save(tenant);
  }

  async updateTenantStatus(id: string, status: TenantStatus): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException(`Tenant con ID #${id} no encontrado.`);
    }
    tenant.status = status;
    return this.tenantRepository.save(tenant);
  }

  async resendInvitation(userId: string): Promise<{ message: string }> {
    return this.authService.resendInvitation(userId);
  }

  async generateTenantLicense(tenantId: string, generateLicenseDto: GenerateLicenseDto) {
    const { userLimit, branchLimit, durationInDays } = generateLicenseDto;
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId }, relations: ['license'] });
    if (!tenant) {
        throw new NotFoundException(`Tenant con ID "${tenantId}" no encontrado.`);
    }

    // If a license exists, revoke it before creating a new one.
    if (tenant.license) {
        await this.licensesService.revokeLicense(tenantId);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationInDays);

    return this.licensesService.generateLicense(tenant, userLimit, branchLimit, expiresAt);
  }

  async revokeTenantLicense(tenantId: string) {
    const tenant = await this.tenantRepository.findOneBy({ id: tenantId });
    if (!tenant) {
        throw new NotFoundException(`Tenant con ID "${tenantId}" no encontrado.`);
    }
    await this.licensesService.revokeLicense(tenantId);
    return { message: 'Licencia revocada con éxito.' };
  }

  async deleteTenant(tenantId: string): Promise<void> {
    try {
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        this.logger.log(`Iniciando borrado transaccional para el tenant ID: ${tenantId}`);
  
        const tenant = await transactionalEntityManager.findOneBy(Tenant, { id: tenantId });
        if (!tenant) {
          throw new NotFoundException(`Tenant con ID #${tenantId} no encontrado.`);
        }
  
        // Nivel 3: Limpieza de tablas de unión
        this.logger.log(`Eliminando dependencias profundas (Order Items, Product Ingredients, etc.)...`);
        const junctionTables = ['order_items', 'product_ingredients', 'inventory_movements'];
        for (const table of junctionTables) {
          const tableExists = (await transactionalEntityManager.query(`SELECT to_regclass('public."${table}"')`))[0].to_regclass;
          if (tableExists) {
            let deleteQuery = '';
            if (table === 'order_items') {
              deleteQuery = `DELETE FROM "order_items" WHERE "orderId" IN (SELECT id FROM "orders" WHERE "tenantId" = $1)`;
            } else if (table === 'product_ingredients') {
              deleteQuery = `DELETE FROM "product_ingredients" WHERE "productId" IN (SELECT id FROM "products" WHERE "tenantId" = $1)`;
            } else if (table === 'inventory_movements') {
              deleteQuery = `DELETE FROM "inventory_movements" WHERE "tenantId" = $1`;
            }
            if (deleteQuery) await transactionalEntityManager.query(deleteQuery, [tenantId]);
          } else {
            this.logger.warn(`Tabla de unión "${table}" no encontrada, se omite la limpieza.`);
          }
        }
  
        // Nivel 2, 1 y 0: Limpieza de todas las demás entidades.
        // FIX: Se usan consultas SQL directas para evitar el error "this.subQuery is not a function" de TypeORM.
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
          } else {
            this.logger.warn(`Tabla principal "${table}" no encontrada, se omite la limpieza.`);
          }
        }
  
        // Finalmente, eliminar el tenant. La cascada en la entidad User se encargará de los usuarios.
        this.logger.log(`Eliminando el registro principal del tenant ${tenantId}...`);
        await transactionalEntityManager.remove(tenant);
      });

      this.logger.log(`Tenant ${tenantId} y todos sus datos asociados han sido eliminados.`);
    } catch (error) {
      this.logger.error(`Error al eliminar el tenant ${tenantId}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Ocurrió un error al eliminar el tenant. La operación fue revertida. Revisa los logs del servidor para más detalles.');
    }
  }
}