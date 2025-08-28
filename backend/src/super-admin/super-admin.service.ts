import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantStatus } from '../tenants/enums/tenant-status.enum';
import { LicensingService } from '../licenses/licensing.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { License } from '../licenses/entities/license.entity';
import { LicenseStatus } from '../licenses/enums/license-status.enum';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
    private readonly licensingService: LicensingService,
  ) {}

  async findAllTenants(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['license'], // Incluir la licencia del tenant
    });
  }

  async updateTenantStatus(id: string, status: TenantStatus): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException(`Tenant con ID "${id}" no encontrado`);
    }
    tenant.status = status;
    return this.tenantRepository.save(tenant);
  }

  async createLicenseForTenant(tenantId: string, createLicenseDto: CreateLicenseDto) {
    const tenant = await this.tenantRepository.findOneBy({ id: tenantId });
    if (!tenant) {
      throw new NotFoundException(`Tenant con ID "${tenantId}" no encontrado`);
    }

    const { userLimit, branchLimit, durationInDays } = createLicenseDto;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationInDays);

    return this.licensingService.generateLicense(tenant, userLimit, branchLimit, expiresAt);
  }

  async revokeLicense(tenantId: string): Promise<License> {
    return this.licensingService.revokeLicenseByTenant(tenantId);
  }

  async getDashboardStats() {
    const totalTenants = await this.tenantRepository.count();
    const tenantsByStatusRaw = await this.tenantRepository
      .createQueryBuilder('tenant')
      .select('tenant.status', 'status')
      .addSelect('COUNT(tenant.id)::int', 'count')
      .groupBy('tenant.status')
      .getRawMany();

    const totalLicenses = await this.licenseRepository.count();
    const licensesByStatusRaw = await this.licenseRepository
      .createQueryBuilder('license')
      .select('license.status', 'status')
      .addSelect('COUNT(license.id)::int', 'count')
      .groupBy('license.status')
      .getRawMany();

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const soonToExpireLicenses = await this.licenseRepository.find({
      where: {
        status: LicenseStatus.Active,
        expiresAt: Between(new Date(), thirtyDaysFromNow),
      },
      relations: ['tenant'],
      order: { expiresAt: 'ASC' },
      take: 5,
    });

    const tenantsByStatus = tenantsByStatusRaw.reduce((acc, { status, count }) => ({ ...acc, [status]: count }), {});
    const licensesByStatus = licensesByStatusRaw.reduce((acc, { status, count }) => ({ ...acc, [status]: count }), {});

    return {
      tenants: {
        total: totalTenants,
        ...tenantsByStatus,
      },
      licenses: {
        total: totalLicenses,
        ...licensesByStatus,
      },
      soonToExpire: soonToExpireLicenses.map((l) => ({
        tenantId: l.tenant.id,
        tenantName: l.tenant.name,
        expiresAt: l.expiresAt,
      })),
    };
  }
}