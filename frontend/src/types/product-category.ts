export interface ProductCategory {
  id: string;
  name: string;
  description?: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type CreateProductCategoryDto = Pick<ProductCategory, 'name' | 'description'>;

export type UpdateProductCategoryDto = Partial<CreateProductCategoryDto>;