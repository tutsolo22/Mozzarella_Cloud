import { IsString, IsNotEmpty, IsEnum, IsUrl, IsOptional, IsBoolean } from 'class-validator';
import { ApiKeyServiceIdentifier } from '../entities/api-key.entity';

export class CreateApiKeyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ApiKeyServiceIdentifier)
  serviceIdentifier: ApiKeyServiceIdentifier;

  @IsUrl({}, { message: 'La URL de la API debe ser una URL válida.' })
  apiUrl: string;

  @IsString()
  @IsNotEmpty()
  key: string; // La clave API en texto plano, antes de ser encriptada

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}