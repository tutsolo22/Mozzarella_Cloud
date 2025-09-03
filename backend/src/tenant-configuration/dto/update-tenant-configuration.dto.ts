import { IsObject, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class UpdateTenantConfigurationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ValidateIf((_object, value) => value !== null) // Permite null, pero si no es null, debe ser un string
  openCageApiKey: string | null;

  @IsOptional()
  @IsObject()
  @ValidateIf((_object, value) => value !== null)
  deliveryArea: any; // Objeto GeoJSON Polygon
}