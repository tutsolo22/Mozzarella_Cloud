import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License } from '../licenses/entities/license.entity';
import { LicenseStatus } from '../licenses/enums/license-status.enum';
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
    });

    if (!license) {
      throw new NotFoundException('La clave de licencia no existe en nuestros registros.');
    }

    // 3. Comprobar si la licencia ha sido revocada
    if (license.status === LicenseStatus.Revocada) {
      throw new UnauthorizedException('Esta licencia ha sido revocada.');
    }

    // 4. Comprobar que la licencia pertenece al tenant correcto
    if (localTenantId && license.tenantId !== localTenantId) {
      throw new UnauthorizedException('Esta licencia no pertenece a este tenant.');
    }
    if (license.tenantId !== payload.tenantId) {
      throw new UnauthorizedException('Inconsistencia en la licencia. Contacte a soporte.');
    }

    // Si todas las comprobaciones pasan, la licencia es válida.
    return {
      isValid: true,
      status: license.status,
      tenantId: license.tenantId,
      userLimit: license.userLimit,
      branchLimit: license.branchLimit,
      expiresAt: license.expiresAt,
    };
  }
}