import { Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantConfiguration } from '../tenant-configuration/entities/tenant-configuration.entity';
import { FilesService } from '../files/files.service';
import * as path from 'path';
import { HexaFactIntegrationService } from '../integrations/hexafact/hexafact-integration.service';
import { UpdateTenantConfigurationDto } from './dto/update-tenant-configuration.dto';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @InjectRepository(TenantConfiguration)
    private readonly tenantConfigRepository: Repository<TenantConfiguration>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly filesService: FilesService,
    private readonly hexaFactIntegrationService: HexaFactIntegrationService,
  ) {}

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ['configuration'],
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant con ID "${id}" no encontrado.`);
    }
    return tenant;
  }

  async findByApiKey(apiKey: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { whatsappApiKey: apiKey },
      relations: ['configuration'],
    });
    if (!tenant) {
      throw new UnauthorizedException('API Key inválida.');
    }
    return tenant;
  }

  async getConfiguration(tenantId: string): Promise<TenantConfiguration> {
    const config = await this.tenantConfigRepository.findOneBy({ tenantId });
    if (!config) {
      throw new NotFoundException('Configuración del negocio no encontrada.');
    }
    return config;
  }

  async updateConfiguration(
    tenantId: string,
    updateConfigDto: UpdateTenantConfigurationDto,
  ): Promise<TenantConfiguration> {
    const currentConfig = await this.getConfiguration(tenantId);
    const wasHexaFactEnabled = currentConfig.isHexaFactIntegrationEnabled;

    Object.assign(currentConfig, updateConfigDto);

    const updatedConfig = await this.tenantConfigRepository.save(currentConfig);

    // --- Lógica de Integración ---
    // Si la integración se acaba de activar, registramos el tenant en HexaFact.
    if (updatedConfig.isHexaFactIntegrationEnabled && !wasHexaFactEnabled) {
      this.logger.log(`La integración con HexaFact fue activada para el tenant ${tenantId}. Iniciando registro.`);
      // Obtenemos la entidad completa del tenant para pasarla al servicio de integración.
      const tenant = await this.tenantRepository.findOne({
        where: { id: tenantId },
        relations: ['users', 'users.role'], // Incluimos los usuarios y sus roles
      });
      if (tenant) {
        await this.hexaFactIntegrationService.registerTenant(tenant);
      }
    }

    return updatedConfig;
  }

  async setInvoicingUrl(tenantId: string, invoicingAppUrl: string): Promise<void> {
    const config = await this.getConfiguration(tenantId);
    if (!config) {
      this.logger.error(`Intento de establecer URL de facturación para un tenant inexistente: ${tenantId}`);
      throw new NotFoundException(`Configuración para el tenant con ID ${tenantId} no encontrada.`);
    }
    config.invoicingAppUrl = invoicingAppUrl;
    await this.tenantConfigRepository.save(config);
    this.logger.log(`URL de facturación actualizada para el tenant ${tenantId}`);
  }

  async setKdsSound(
    tenantId: string,
    file: Express.Multer.File | null,
  ): Promise<TenantConfiguration> {
    const config = await this.getConfiguration(tenantId);

    if (config.kdsNotificationSoundUrl) {
      try {
        const oldFileKey = path.basename(config.kdsNotificationSoundUrl);
        if (oldFileKey) {
          await this.filesService.deletePublicFile(oldFileKey, tenantId);
        }
      } catch (error) {
        this.logger.warn(`No se pudo eliminar el archivo de sonido anterior: ${error.message}`);
      }
    }

    if (!file) {
      config.kdsNotificationSoundUrl = null;
    } else {
      const uploadedFile = await this.filesService.uploadPublicFile(file, tenantId);
      config.kdsNotificationSoundUrl = uploadedFile.url;
    }

    return this.tenantConfigRepository.save(config);
  }
}