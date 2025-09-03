import {
  IsOptional,
  IsString,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class UpdateTenantConfigurationDto {
  @IsOptional()
  @IsString()
  apiKeyGeocoding?: string;

  @IsOptional()
  @IsString()
  directionsApiKey?: string;

  @IsOptional()
  @IsLatitude()
  restaurantLatitude?: number;

  @IsOptional()
  @IsLongitude()
  restaurantLongitude?: number;

  @IsOptional()
  deliveryArea?: any;
}