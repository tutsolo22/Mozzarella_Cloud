import { IsArray, ValidateNested, IsUUID, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class PurchaseItemDto {
  @IsUUID()
  ingredientId: string;

  @IsNumber()
  @Min(0.01) // Must purchase a positive quantity
  quantity: number;
}

export class PurchaseIngredientsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  ingredients: PurchaseItemDto[];
}