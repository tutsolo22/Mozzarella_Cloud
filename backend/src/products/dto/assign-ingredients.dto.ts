import { IsArray, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class IngredientAssignment {
  @IsUUID()
  ingredientId: string;

  @IsNumber()
  @Min(0)
  quantityRequired: number;
}

export class AssignIngredientsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientAssignment)
  ingredients: IngredientAssignment[];
}