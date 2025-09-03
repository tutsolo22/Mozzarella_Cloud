export interface ProductCategory {
  id: string;
  name: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductCategoryDto {
  name: string;
}

export type UpdateProductCategoryDto = Partial<CreateProductCategoryDto>;