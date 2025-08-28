import {
  IsArray,
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class StockAdjustmentItemDto {
  @IsUUID()
  ingredientId: string;

  @IsNumber()
  @Min(0)
  newQuantity: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class AdjustStockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockAdjustmentItemDto)
  items: StockAdjustmentItemDto[];
}