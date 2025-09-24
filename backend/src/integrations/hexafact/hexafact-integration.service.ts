import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ApiKeysService } from '../../api-keys/api-keys.service';
import { ExternalService } from '../../api-keys/entities/api-key.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Injectable()
export class HexaFactIntegrationService {
  private readonly logger = new Logger(HexaFactIntegrationService.name);
  private readonly hexafactApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly apiKeysService: ApiKeysService,
  ) {
    this.hexafactApiUrl = this.configService.get<string>('HEXAFACT_API_URL');
  }

  async registerTenant(tenant: Tenant): Promise<void> {
    if (!this.hexafactApiUrl) {
      this.logger.error('HEXAFACT_API_URL no está configurada. No se puede registrar el tenant.');
      return;
    }

    const apiKey = await this.apiKeysService.getDecryptedKey(tenant.id, ExternalService.INVOICING);
    if (!apiKey) {
      this.logger.warn(`No se encontró API Key de facturación para el tenant ${tenant.id}. No se puede registrar en HexaFact.`);
      return;
    }

    const payload = {
      name: tenant.name,
      adminEmail: tenant.users.find(u => u.role.name === 'admin')?.email,
    };

    try {
      this.logger.log(`Registrando tenant ${tenant.id} en HexaFact...`);
      await firstValueFrom(this.httpService.post(`${this.hexafactApiUrl}/api/tenants`, payload, { headers: { 'X-API-Key': apiKey } }));
      this.logger.log(`Tenant ${tenant.id} registrado exitosamente en HexaFact.`);
    } catch (error) {
      this.logger.error(`Error al registrar el tenant ${tenant.id} en HexaFact: ${error.message}`, error.stack);
    }
  }
}