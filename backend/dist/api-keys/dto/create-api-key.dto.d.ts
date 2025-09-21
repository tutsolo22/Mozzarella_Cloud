import { ApiKeyServiceIdentifier } from '../entities/api-key.entity';
export declare class CreateApiKeyDto {
    name: string;
    serviceIdentifier: ApiKeyServiceIdentifier;
    apiUrl: string;
    key: string;
    isActive?: boolean;
}
