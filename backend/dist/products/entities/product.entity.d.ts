import { ProductCategory } from './product-category.entity';
import { ProductIngredient } from './product-ingredient.entity';
export declare class Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    isAvailable: boolean;
    category: ProductCategory;
    categoryId: string;
    ingredients: ProductIngredient[];
    createdAt: Date;
    updatedAt: Date;
}
