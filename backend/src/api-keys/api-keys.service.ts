import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey, ApiKeyServiceIdentifier } from './entities/api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(tenantId: string, createApiKeyDto: CreateApiKeyDto): Promise<ApiKey> {
    const { key, ...rest } = createApiKeyDto;
    const encryptedKey = this.encryptionService.encrypt(key);

    const newApiKey = this.apiKeyRepository.create({
      ...rest,
      tenantId,
      key: encryptedKey,
    });

    return this.apiKeyRepository.save(newApiKey);
  }

  async findAllForTenant(tenantId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepository.findOneBy({ id, tenantId });
    if (!apiKey) {
      throw new NotFoundException(`API Key con ID ${id} no encontrada para este tenant.`);
    }
    return apiKey;
  }

  async getDecryptedKey(id: string, tenantId: string): Promise<string> {
    const apiKey = await this.findOne(id, tenantId);
    return this.encryptionService.decrypt(apiKey.key);
  }

  async findActiveKeyForService(tenantId: string, service: ApiKeyServiceIdentifier): Promise<ApiKey | null> {
    return this.apiKeyRepository.findOneBy({
      tenantId,
      serviceIdentifier: service,
      isActive: true,
    });
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.apiKeyRepository.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`API Key con ID ${id} no encontrada para este tenant.`);
    }
  }
}