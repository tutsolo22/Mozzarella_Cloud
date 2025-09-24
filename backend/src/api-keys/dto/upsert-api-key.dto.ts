import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ExternalService } from '../entities/api-key.entity';

export class UpsertApiKeyDto {
  @IsEnum(ExternalService)
  @IsNotEmpty()
  serviceIdentifier: ExternalService;

  @IsString()
  @IsNotEmpty()
  key: string; // The raw, unencrypted key
}