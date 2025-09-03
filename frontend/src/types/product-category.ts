export interface ProductCategory {
  id: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type CreateProductCategoryDto = Pick<ProductCategory, 'name'>;

export type UpdateProductCategoryDto = Partial<CreateProductCategoryDto>;