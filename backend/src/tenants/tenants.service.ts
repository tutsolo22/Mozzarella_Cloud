import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantConfiguration } from '../tenant-configuration/entities/tenant-configuration.entity';
import { FilesService } from '../files/files.service';
import * as path from 'path';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @InjectRepository(TenantConfiguration)
    private readonly tenantConfigRepository: Repository<TenantConfiguration>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly filesService: FilesService,
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
      // In a real scenario, we might create a default one. For now, we throw.
      throw new NotFoundException('Configuración del negocio no encontrada.');
    }
    return config;
  }

  async updateConfiguration(
    tenantId: string,
    updateConfigDto: Partial<TenantConfiguration>,
  ): Promise<TenantConfiguration> {
    const config = await this.getConfiguration(tenantId);
    // Ensure only allowed fields are updated from this generic endpoint
    const allowedUpdates = ['deliveryArea', 'directionsApiKey'] as const;
    for (const key of allowedUpdates) {
      if (updateConfigDto[key] !== undefined) {
        config[key] = updateConfigDto[key];
      }
    }
    return this.tenantConfigRepository.save(config);
  }

  async setKdsSound(
    tenantId: string,
    file: Express.Multer.File | null,
  ): Promise<TenantConfiguration> {
    const config = await this.getConfiguration(tenantId);

    // If a sound already exists, delete it from storage first
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
      // The filesService will generate a unique name for the file inside the tenant's folder.
      const uploadedFile = await this.filesService.uploadPublicFile(file, tenantId);
      config.kdsNotificationSoundUrl = uploadedFile.url;
    }

    return this.tenantConfigRepository.save(config);
  }
}