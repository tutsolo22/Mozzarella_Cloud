import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey, ExternalService } from './entities/api-key.entity';
import { EncryptionService } from '../encryption/encryption.service';
import { UpsertApiKeyDto } from './dto/upsert-api-key.dto';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async upsert(
    tenantId: string,
    upsertApiKeyDto: UpsertApiKeyDto,
  ): Promise<ApiKey> {
    const { serviceIdentifier, key } = upsertApiKeyDto;
    const encryptedKey = this.encryptionService.encrypt(key);

    let apiKey = await this.apiKeyRepository.findOneBy({
      tenantId,
      serviceIdentifier,
    });

    if (apiKey) {
      // Update existing key
      apiKey.key = encryptedKey;
    } else {
      // Create new key
      apiKey = this.apiKeyRepository.create({
        tenantId,
        serviceIdentifier,
        key: encryptedKey,
      });
    }

    return this.apiKeyRepository.save(apiKey);
  }

  async getDecryptedKey(
    tenantId: string,
    service: ExternalService,
  ): Promise<string | null> {
    const apiKey = await this.apiKeyRepository.findOneBy({
      tenantId,
      serviceIdentifier: service,
    });

    if (!apiKey) {
      return null;
    }

    return this.encryptionService.decrypt(apiKey.key);
  }

  async findAllForTenant(tenantId: string): Promise<ApiKey[]> {
    // We don't return the key itself in the list for security
    return this.apiKeyRepository.find({
      where: { tenantId },
      select: ['id', 'serviceIdentifier', 'createdAt', 'updatedAt'],
    });
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.apiKeyRepository.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(
        `API Key con ID ${id} no encontrada para este tenant.`,
      );
    }
  }
}