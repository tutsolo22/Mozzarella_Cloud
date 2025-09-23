import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantConfiguration } from './entities/tenant-configuration.entity';
import { UpdateTenantConfigurationDto } from './dto/update-tenant-configuration.dto';

@Injectable()
export class TenantConfigurationService {
  constructor(
    @InjectRepository(TenantConfiguration)
    private readonly configRepository: Repository<TenantConfiguration>,
  ) {}

  async getConfiguration(tenantId: string): Promise<TenantConfiguration> {
    // Cada tenant debe tener una configuración creada al momento de su creación.
    const config = await this.configRepository.findOne({
      where: { tenantId: tenantId },
    });

    if (!config) {
      throw new NotFoundException('Configuración del tenant no encontrada.');
    }
    return config;
  }

  async updateConfiguration(
    tenantId: string,
    updateDto: UpdateTenantConfigurationDto,
  ): Promise<TenantConfiguration> {
    const config = await this.getConfiguration(tenantId);
    Object.assign(config, updateDto);
    return this.configRepository.save(config);
  }
}