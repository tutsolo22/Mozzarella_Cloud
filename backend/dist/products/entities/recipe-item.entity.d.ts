import { Product } from './product.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
export declare class RecipeItem {
    id: string;
    quantityRequired: number;
    productId: string;
    ingredientId: string;
    product: Product;
    ingredient: Ingredient;
}
