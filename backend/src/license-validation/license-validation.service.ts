import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License, LicenseStatus } from '../licenses/entities/license.entity';
import { LicensePayload } from '../licenses/licensing.service';

@Injectable()
export class LicenseValidationService {
  constructor(
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
    private readonly jwtService: JwtService,
  ) {}

  async validate(licenseKey: string, localTenantId?: string): Promise<any> {
    let payload: LicensePayload;

    try {
      // 1. Verificar la firma y expiración del JWT
      payload = this.jwtService.verify<LicensePayload>(licenseKey);
    } catch (error) {
      throw new UnauthorizedException('La clave de licencia no es válida o ha expirado.');
    }

    // 2. Encontrar la licencia en la base de datos
    const license = await this.licenseRepository.findOne({
      where: { key: licenseKey },
      relations: ['tenant'],
    });

    if (!license) {
      throw new NotFoundException('La clave de licencia no existe en nuestros registros.');
    }

    // 3. Comprobar si la licencia ha sido revocada
    if (license.status === LicenseStatus.Revoked) {
      throw new UnauthorizedException('Esta licencia ha sido revocada.');
    }

    if (!license.tenant) {
      throw new UnauthorizedException('La licencia no está asociada a ningún tenant. Contacte a soporte.');
    }

    // 4. Comprobar que la licencia pertenece al tenant correcto
    if (localTenantId && license.tenant.id !== localTenantId) {
      throw new UnauthorizedException('Esta licencia no pertenece a este tenant.');
    }
    if (license.tenant.id !== payload.tenantId) {
      throw new UnauthorizedException('Inconsistencia en la licencia. Contacte a soporte.');
    }

    // Si todas las comprobaciones pasan, la licencia es válida.
    return {
      isValid: true,
      status: license.status,
      tenantId: license.tenant.id,
      userLimit: license.userLimit,
      branchLimit: license.branchLimit,
      expiresAt: license.expiresAt,
    };
  }
}