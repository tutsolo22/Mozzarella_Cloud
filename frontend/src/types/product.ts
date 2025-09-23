import { PreparationZone } from './preparation-zone';
import { ProductCategory } from './product-category';

export interface ProductCategoryDto {
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: ProductCategory;
  imageUrl?: string;
  isAvailable: boolean;
  recipeIsSet: boolean;
  deletedAt?: string;
  preparationZone?: PreparationZone;

  // Datos Fiscales
  satProductKey?: string | null;
  satUnitKey?: string | null;
  isTaxable: boolean; // The backend entity has a default, so it will always be present.
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  preparationZoneId?: string | null;
  isAvailable?: boolean;
  satProductKey?: string;
  satUnitKey?: string;
  isTaxable?: boolean;
}

export type UpdateProductDto = Partial<CreateProductDto>;

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