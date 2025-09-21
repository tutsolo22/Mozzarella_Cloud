import { Repository } from 'typeorm';
import { ApiKey, ApiKeyServiceIdentifier } from './entities/api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { EncryptionService } from '../common/services/encryption.service';
export declare class ApiKeysService {
    private readonly apiKeyRepository;
    private readonly encryptionService;
    constructor(apiKeyRepository: Repository<ApiKey>, encryptionService: EncryptionService);
    create(tenantId: string, createApiKeyDto: CreateApiKeyDto): Promise<ApiKey>;
    findAllForTenant(tenantId: string): Promise<ApiKey[]>;
    findOne(id: string, tenantId: string): Promise<ApiKey>;
    getDecryptedKey(id: string, tenantId: string): Promise<string>;
    findActiveKeyForService(tenantId: string, service: ApiKeyServiceIdentifier): Promise<ApiKey | null>;
    remove(id: string, tenantId: string): Promise<void>;
}
