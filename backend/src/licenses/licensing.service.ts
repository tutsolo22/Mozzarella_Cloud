import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { License, LicenseStatus } from './entities/license.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

export interface LicensePayload {
  tenantId: string;
  userLimit: number;
  branchLimit: number;
  exp: number; // Expiration time (unix timestamp)
}

@Injectable()
export class LicensingService {
  constructor(
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
    private readonly jwtService: JwtService,
  ) {}

  async generateLicense(tenant: Tenant, userLimit: number, branchLimit: number, expiresAt: Date, queryRunner?: QueryRunner): Promise<License> {
    const manager = queryRunner ? queryRunner.manager : this.licenseRepository.manager;

    const payload: LicensePayload = {
      tenantId: tenant.id,
      userLimit,
      branchLimit,
      exp: Math.floor(expiresAt.getTime() / 1000), // JWT 'exp' claim
    };
    const licenseKey = this.jwtService.sign(payload);

    const newLicense = manager.create(License, {
      key: licenseKey,
      tenant,
      userLimit,
      branchLimit,
      expiresAt,
      status: LicenseStatus.Active,
    });

    await manager.save(newLicense);
    return newLicense;
  }

  async revokeLicense(tenantId: string): Promise<License> {
    const license = await this.licenseRepository.findOne({ where: { tenant: { id: tenantId } } });
    if (!license) {
      // This shouldn't happen if called from generateTenantLicense, but it's good practice.
      throw new NotFoundException(`No se encontró una licencia para el tenant con ID "${tenantId}".`);
    }

    license.status = LicenseStatus.Revoked;
    return this.licenseRepository.save(license);
  }
}