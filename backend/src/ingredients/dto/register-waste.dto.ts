import {
  IsArray,
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class WasteItemDto {
  @IsUUID()
  @IsNotEmpty()
  ingredientId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class RegisterWasteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WasteItemDto)
  items: WasteItemDto[];
}