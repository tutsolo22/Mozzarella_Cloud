import { ProductCategory } from './product-category';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  recipeIsSet: boolean;
  category: ProductCategory;
  tenantId: string;
  locationId: string;
  deletedAt?: string | null; // For soft-delete
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable?: boolean;
}

export type UpdateProductDto = Partial<CreateProductDto>;