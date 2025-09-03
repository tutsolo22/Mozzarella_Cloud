export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string; // This property indicates if the category is soft-deleted
}

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
  deletedAt?: string;
}

export type CreateProductDto = Omit<Product, 'id' | 'category' | 'isAvailable' | 'deletedAt'> & { categoryId: string };
export type UpdateProductDto = Partial<CreateProductDto>;

export interface Ingredient {
  id: string;
  name: string;
  stockQuantity: number;
  unit: string;
  lowStockThreshold: number;
}

export type CreateIngredientDto = Omit<Ingredient, 'id'>;

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