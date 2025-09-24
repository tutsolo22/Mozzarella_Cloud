import { Repository } from 'typeorm';
import { ApiKey, ExternalService } from './entities/api-key.entity';
import { EncryptionService } from '../encryption/encryption.service';
import { UpsertApiKeyDto } from './dto/upsert-api-key.dto';
export declare class ApiKeysService {
    private readonly apiKeyRepository;
    private readonly encryptionService;
    constructor(apiKeyRepository: Repository<ApiKey>, encryptionService: EncryptionService);
    upsert(tenantId: string, upsertApiKeyDto: UpsertApiKeyDto): Promise<ApiKey>;
    getDecryptedKey(tenantId: string, service: ExternalService): Promise<string | null>;
    findAllForTenant(tenantId: string): Promise<ApiKey[]>;
    remove(id: string, tenantId: string): Promise<void>;
}
