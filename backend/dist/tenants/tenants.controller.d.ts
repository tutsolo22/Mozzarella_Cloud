import { TenantsService } from './tenants.service';
import { TenantConfiguration } from './entities/tenant-configuration.entity';
import { UserPayload } from '../auth/decorators/user.decorator';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    getConfiguration(user: UserPayload): Promise<TenantConfiguration>;
    updateConfiguration(user: UserPayload, updateConfigDto: Partial<TenantConfiguration>): Promise<TenantConfiguration>;
    setKdsSound(file: Express.Multer.File, user: UserPayload): Promise<TenantConfiguration>;
    removeKdsSound(user: UserPayload): Promise<TenantConfiguration>;
}
