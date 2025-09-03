import { Injectable, Inject, forwardRef, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Tenant } from './entities/tenant.entity';
import { TenantStatus } from './enums/tenant-status.enum';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UsersService } from '../users/users.service';
import { LicensingService } from '../licenses/licensing.service';
import { TenantConfiguration } from './entities/tenant-configuration.entity';
import { Role } from '../roles/entities/role.entity';
import { RoleEnum } from '../roles/enums/role.enum';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly licensingService: LicensingService,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const existingTenant = await this.tenantRepository.findOne({ where: { name: createTenantDto.name } });
    if (existingTenant) {
      throw new ConflictException('Ya existe un tenant con ese nombre.');
    }

    const newTenant = this.tenantRepository.create({
      name: createTenantDto.name,
      status: TenantStatus.Activo,
      // Aquí creamos la configuración por defecto.
      // La relación `cascade: true` en la entidad Tenant se encarga de guardarla.
      configuration: new TenantConfiguration(),
    });

    const savedTenant = await this.tenantRepository.save(newTenant);

    const adminRole = await this.roleRepository.findOneBy({ name: RoleEnum.Admin });
    if (!adminRole) {
      // This would be a server configuration error, but good to handle.
      throw new NotFoundException('El rol de "Administrador" no se encuentra en el sistema.');
    }

    // Creamos el usuario administrador para este nuevo tenant
    await this.usersService.create(
      {
        email: createTenantDto.adminEmail,
        password: createTenantDto.adminPassword,
        fullName: 'Administrador',
        roleId: adminRole.id,
      },
      savedTenant.id,
    );

    // Generamos una licencia de prueba por 30 días
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await this.licensingService.generateLicense(savedTenant, 5, 1, expiresAt);

    return this.findOne(savedTenant.id);
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id }, relations: ['license', 'configuration'] });
    if (!tenant) throw new NotFoundException(`Tenant con ID "${id}" no encontrado.`);
    return tenant;
  }

  async getConfiguration(tenantId: string): Promise<TenantConfiguration> {
    const tenant = await this.findOne(tenantId);
    return tenant.configuration;
  }

  async updateConfiguration(tenantId: string, updateDto: Partial<TenantConfiguration>): Promise<TenantConfiguration> {
    const tenant = await this.findOne(tenantId);

    // Merge and save the configuration
    const newConfig = { ...tenant.configuration, ...updateDto };
    tenant.configuration = newConfig;

    await this.tenantRepository.save(tenant);
    return newConfig;
  }

  findByApiKey(apiKey: string): Promise<Tenant | null> {
    return this.tenantRepository.findOneBy({ whatsappApiKey: apiKey });
  }

  async regenerateWhatsappApiKey(tenantId: string): Promise<string> {
    const newApiKey = randomBytes(32).toString('hex');
    await this.tenantRepository.update(tenantId, { whatsappApiKey: newApiKey });
    return newApiKey;
  }
}