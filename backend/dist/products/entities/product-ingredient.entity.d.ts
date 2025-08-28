import { Product } from './product.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
export declare class ProductIngredient {
    id: string;
    quantityRequired: number;
    product: Product;
    productId: string;
    ingredient: Ingredient;
    ingredientId: string;
}
