import { UserPayload } from '../auth/decorators/user.decorator';
import { TenantConfigurationService } from './tenant-configuration.service';
import { UpdateTenantConfigurationDto } from './dto/update-tenant-configuration.dto';
import { TenantConfiguration } from '../tenants/entities/tenant-configuration.entity';
export declare class TenantConfigurationController {
    private readonly configService;
    constructor(configService: TenantConfigurationService);
    getConfiguration(user: UserPayload): Promise<TenantConfiguration>;
    updateConfiguration(user: UserPayload, updateDto: UpdateTenantConfigurationDto): Promise<TenantConfiguration>;
}
