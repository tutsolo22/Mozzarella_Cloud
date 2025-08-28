export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  imageUrl: string;
  category: ProductCategory;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  tenantId: string;
  name: string;
  stockQuantity: number;
  unit: string;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeItem {
  id: string;
  quantityRequired: number;
  productId: string;
  ingredientId: string;
  ingredient: Ingredient;
}