import { IsString, IsNotEmpty, MaxLength, IsNumber, IsPositive, IsOptional, IsUUID, IsBoolean, IsUrl } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsUUID()
  categoryId: string;

  @IsUUID()
  @IsOptional()
  preparationZoneId?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  satProductKey?: string;

  @IsString()
  @IsOptional()
  satUnitKey?: string;

  @IsBoolean()
  @IsOptional()
  isTaxable?: boolean;
}