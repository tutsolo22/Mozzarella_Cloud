import { TenantsService } from './tenants.service';
import { TenantConfiguration } from '../tenant-configuration/entities/tenant-configuration.entity';
import { UserPayload } from '../auth/decorators/user.decorator';
import { UpdateTenantConfigurationDto } from './dto/update-tenant-configuration.dto';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    getConfiguration(user: UserPayload): Promise<TenantConfiguration>;
    updateConfiguration(user: UserPayload, updateConfigDto: UpdateTenantConfigurationDto): Promise<TenantConfiguration>;
    setKdsSound(file: Express.Multer.File, user: UserPayload): any;
    removeKdsSound(user: UserPayload): any;
}
