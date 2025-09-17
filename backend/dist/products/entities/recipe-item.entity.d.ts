import { Product } from './product.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
export declare class RecipeItem {
    id: string;
    productId: string;
    ingredientId: string;
    quantityRequired: number;
    product: Product;
    ingredient: Ingredient;
}
