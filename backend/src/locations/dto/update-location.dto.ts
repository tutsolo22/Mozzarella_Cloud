import {
  IsString,
  IsOptional,
  IsLatitude,
  IsLongitude,
  MinLength,
} from 'class-validator';

export class UpdateLocationDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  address?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;
}