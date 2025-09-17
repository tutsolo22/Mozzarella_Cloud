import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantConfiguration } from './entities/tenant-configuration.entity';
import { FilesService } from '../files/files.service';
export declare class TenantsService {
    private readonly tenantConfigRepository;
    private readonly tenantRepository;
    private readonly filesService;
    private readonly logger;
    constructor(tenantConfigRepository: Repository<TenantConfiguration>, tenantRepository: Repository<Tenant>, filesService: FilesService);
    findOne(id: string): Promise<Tenant>;
    findByApiKey(apiKey: string): Promise<Tenant>;
    getConfiguration(tenantId: string): Promise<TenantConfiguration>;
    updateConfiguration(tenantId: string, updateConfigDto: Partial<TenantConfiguration>): Promise<TenantConfiguration>;
    setKdsSound(tenantId: string, file: Express.Multer.File | null): Promise<TenantConfiguration>;
}
