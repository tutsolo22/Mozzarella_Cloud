import { Repository } from 'typeorm';
import { TenantConfiguration } from './entities/tenant-configuration.entity';
import { UpdateTenantConfigurationDto } from './dto/update-tenant-configuration.dto';
export declare class TenantConfigurationService {
    private readonly configRepository;
    constructor(configRepository: Repository<TenantConfiguration>);
    getConfiguration(tenantId: string): Promise<TenantConfiguration>;
    updateConfiguration(tenantId: string, updateDto: UpdateTenantConfigurationDto): Promise<TenantConfiguration>;
}
