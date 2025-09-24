import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantConfiguration } from '../tenant-configuration/entities/tenant-configuration.entity';
import { FilesService } from '../files/files.service';
import { HexaFactIntegrationService } from '../integrations/hexafact/hexafact-integration.service';
import { UpdateTenantConfigurationDto } from './dto/update-tenant-configuration.dto';
export declare class TenantsService {
    private readonly tenantConfigRepository;
    private readonly tenantRepository;
    private readonly filesService;
    private readonly hexaFactIntegrationService;
    private readonly logger;
    private readonly logger;
    constructor(tenantConfigRepository: Repository<TenantConfiguration>, tenantRepository: Repository<Tenant>, filesService: FilesService, hexaFactIntegrationService: HexaFactIntegrationService, logger: Logger);
    findOne(id: string): Promise<Tenant>;
    findByApiKey(apiKey: string): Promise<Tenant>;
    getConfiguration(tenantId: string): Promise<TenantConfiguration>;
    updateConfiguration(tenantId: string, updateConfigDto: Partial<TenantConfiguration>, updateConfigDto: UpdateTenantConfigurationDto): Promise<TenantConfiguration>;
}
