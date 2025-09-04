import {
  IsString,
  IsNotEmpty,
  IsOptional, IsJSON,
} from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsJSON()
  deliveryArea?: any; // GeoJSON Polygon
}