import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantConfigurationDto } from './dto/update-tenant-configuration.dto';
import { FilesService } from '../files/files.service';
export declare class TenantsController {
    private readonly tenantsService;
    private readonly filesService;
    constructor(tenantsService: TenantsService, filesService: FilesService);
    create(createTenantDto: CreateTenantDto): Promise<import("./entities/tenant.entity").Tenant>;
    getConfiguration(req: any): Promise<import("./entities/tenant-configuration.entity").TenantConfiguration>;
    updateConfiguration(req: any, updateDto: UpdateTenantConfigurationDto): Promise<import("./entities/tenant-configuration.entity").TenantConfiguration>;
    uploadKdsSound(file: Express.Multer.File, req: any): Promise<import("./entities/tenant-configuration.entity").TenantConfiguration>;
}
