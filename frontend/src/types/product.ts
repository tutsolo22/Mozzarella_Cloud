import { PreparationZone } from './preparation-zone';
import { ProductCategory } from './product-category';

export interface ProductCategoryDto {
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl?: string;
  isAvailable: boolean;
  recipeIsSet: boolean;
  deletedAt?: string;
  preparationZone?: PreparationZone;
}

export type CreateProductDto = Omit<Product, 'id' | 'category' | 'isAvailable' | 'recipeIsSet' | 'deletedAt' | 'preparationZone'> & { categoryId: string; preparationZoneId?: string | null; };
export type UpdateProductDto = Partial<CreateProductDto & { isAvailable: boolean }>;

export interface Ingredient {
  id: string;
  name: string;
  stockQuantity: number;
  unit: string;
  lowStockThreshold: number;
}

export type CreateIngredientDto = Omit<Ingredient, 'id'>;
export type UpdateIngredientDto = Partial<Omit<Ingredient, 'id' | 'stockQuantity'>>;

export interface RecipeItem {
  ingredientId: string;
  quantityRequired: number;
  // The backend sends the full ingredient object, which is very useful.
  ingredient: {
    id: string;
    name: string;
    unit: string;
  };
}