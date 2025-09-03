import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdjustStockItemDto {
  @IsUUID()
  ingredientId: string;

  @IsNumber()
  newQuantity: number;

  @IsString()
  reason: string;
}

export class AdjustStockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdjustStockItemDto)
  items: AdjustStockItemDto[];
}