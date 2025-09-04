import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License } from './entities/license.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { LicenseStatus } from './enums/license-status.enum';

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

  async generateLicense(tenant: Tenant, userLimit: number, branchLimit: number, expiresAt: Date): Promise<License> {
    const payload: LicensePayload = {
      tenantId: tenant.id,
      userLimit,
      branchLimit,
      exp: Math.floor(expiresAt.getTime() / 1000), // JWT 'exp' claim
    };

    const licenseKey = this.jwtService.sign(payload);

    const newLicense = this.licenseRepository.create({
      key: licenseKey,
      tenant,
      userLimit,
      branchLimit,
      expiresAt,
    });

    await this.licenseRepository.save(newLicense);

    return newLicense;
  }

  async revokeLicenseByTenant(tenantId: string): Promise<License> {
    const license = await this.licenseRepository.findOne({ where: { tenantId } });
    if (!license) {
      throw new NotFoundException(`No se encontró una licencia para el tenant con ID "${tenantId}".`);
    }

    license.status = LicenseStatus.Revoked;
    return this.licenseRepository.save(license);
  }
}