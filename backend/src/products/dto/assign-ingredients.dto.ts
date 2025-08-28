import { IsArray, IsNotEmpty, IsNumber, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RecipeItemDto {
  @IsUUID()
  @IsNotEmpty()
  ingredientId: string;

  @IsNumber()
  @IsNotEmpty()
  quantityRequired: number;
}

export class AssignIngredientsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  ingredients: RecipeItemDto[];
}