import { Product } from './product.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
export declare class ProductIngredient {
    productId: string;
    ingredientId: string;
    product: Product;
    ingredient: Ingredient;
    quantityRequired: number;
}
