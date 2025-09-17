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
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { Location } from '../locations/entities/location.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { ProductCategory } from '../products/entities/product-category.entity';
import { TenantConfiguration } from '../tenants/entities/tenant-configuration.entity';
import { LicensingService } from '../licenses/licensing.service';
import { GenerateLicenseDto } from '../licenses/dto/generate-license.dto';
import { AuthService } from '../auth/auth.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar si el tenant ya existe para evitar errores de duplicados.
      const existingTenant = await queryRunner.manager.findOneBy(Tenant, { name });
      if (existingTenant) {
        throw new ConflictException(`El tenant con el nombre "${name}" ya existe.`);
      }

      // Verificar si el email del admin ya existe
      const existingUser = await queryRunner.manager.findOneBy(User, { email: adminEmail });
      if (existingUser) {
        throw new ConflictException(`El email de administrador "${adminEmail}" ya está en uso.`);
      }

      // Crear el tenant
      const tenant = queryRunner.manager.create(Tenant, { name });
      await queryRunner.manager.save(tenant);

      // Encontrar el rol de Admin
      const adminRole = await queryRunner.manager.findOneBy(Role, { name: RoleEnum.Admin });
      if (!adminRole) {
        throw new InternalServerErrorException('El rol de Administrador base no existe.');
      }

      // Crear el usuario administrador
      const temporaryPassword = crypto.randomBytes(20).toString('hex');
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      const adminUser = queryRunner.manager.create(User, {
        email: adminEmail,
        fullName: adminFullName,
        password: hashedPassword,
        role: adminRole,
        tenant: tenant,
        status: UserStatus.PendingVerification,
      });
      await queryRunner.manager.save(adminUser);

      await queryRunner.commitTransaction();

      await this.authService.resendInvitation(adminUser.id);

      return tenant;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error al crear el tenant: ${error}`);
      if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Ocurrió un error al crear el tenant.');
    } finally {
      await queryRunner.release();
    }
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

  async deleteTenant(tenantId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tenant = await queryRunner.manager.findOneBy(Tenant, { id: tenantId });
      if (!tenant) {
        throw new NotFoundException(`Tenant con ID #${tenantId} no encontrado.`);
      }

      // El error se debe a que múltiples entidades (productos, sucursales, pedidos, etc.)
      // tienen una relación con el tenant. Para borrar el tenant, primero debemos
      // eliminar todos estos datos asociados en el orden correcto para no violar
      // las restricciones de la base de datos (foreign key constraints).
      // La solución anterior era incompleta. Esta versión es más exhaustiva.

      // Paso 1: Eliminar entidades anidadas que impiden la eliminación de sus padres.
      // El error "transaction is aborted" ocurre porque un error en una consulta (p. ej., tabla no encontrada)
      // invalida toda la transacción. La solución es no intentar eliminar de tablas que no existen,
      // lo cual es común en tenants nuevos. Primero verificamos si la tabla existe.
      const orderItemTableExists = await queryRunner.query("SELECT to_regclass('public.order_item')");
      if (orderItemTableExists[0].to_regclass) {
        await queryRunner.query(
          'DELETE FROM "order_item" WHERE "orderId" IN (SELECT id FROM "order" WHERE "tenantId" = $1)',
          [tenantId],
        );
      } else {
        this.logger.warn('Table "order_item" not found, skipping cleanup. This is expected for new tenants.');
      }

      const recipeItemTableExists = await queryRunner.query("SELECT to_regclass('public.recipe_item')");
      if (recipeItemTableExists[0].to_regclass) {
        await queryRunner.query(
          'DELETE FROM "recipe_item" WHERE "productId" IN (SELECT id FROM "product" WHERE "tenantId" = $1)',
          [tenantId],
        );
      } else {
        this.logger.warn('Table "recipe_item" not found, skipping cleanup. This is expected for new tenants.');
      }
      // (Añadir aquí otras entidades anidadas si las hubiera, ej: movimientos de inventario)

      // Paso 2: Eliminar las entidades principales que ahora están "libres".
      await queryRunner.manager.delete(Order, { tenantId });
      await queryRunner.manager.delete(Product, { tenantId });
      await queryRunner.manager.delete(User, { tenantId });

      // Paso 3: Eliminar entidades base y de configuración.
      await queryRunner.manager.delete(TenantConfiguration, { tenantId });
      await queryRunner.manager.delete(Location, { tenantId });
      await queryRunner.manager.delete(Customer, { tenantId });
      await queryRunner.manager.delete(Ingredient, { tenantId });
      await queryRunner.manager.delete(ProductCategory, { tenantId });
      // The License entity does not have a `tenantId` property, but a `tenant` relation.
      // The `delete` method doesn't work with relations in the `where` clause.
      // So, we find the license by the tenant's ID and then remove it.
      const license = await queryRunner.manager.findOne(License, { where: { tenant: { id: tenantId } } });
      if (license) {
        await queryRunner.manager.remove(license);
      }
      // (Añadir aquí otras como Position, Employee, OverheadCost, etc. si es necesario)

      // Paso 4: Finalmente, eliminar el tenant.
      await queryRunner.manager.remove(tenant);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error al eliminar el tenant ${tenantId}:`, error);
      if (error.message.includes('transaction is aborted')) {
        throw new InternalServerErrorException(
          'La transacción fue abortada debido a un error inesperado. Revisa los logs del servidor para más detalles.',
        );
      }
      throw new InternalServerErrorException(
        'Ocurrió un error al eliminar el tenant. Es posible que aún existan datos asociados. Revisa los logs del servidor para más detalles.',
      );
    } finally {
      await queryRunner.release();
    }
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
}