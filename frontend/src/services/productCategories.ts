import api from '../api/axiosClient';
import { ProductCategory, ProductCategoryDto } from '../types/product';

export const getAllProductCategories = (
  includeDeleted = false,
): Promise<ProductCategory[]> => {
  return api.get('/product-categories', {
    params: { includeDeleted },
  });
};

export const createProductCategory = (
  data: ProductCategoryDto,
): Promise<ProductCategory> => {
  return api.post('/product-categories', data);
};

export const updateProductCategory = (
  id: string,
  data: Partial<ProductCategoryDto>,
): Promise<ProductCategory> => {
  return api.patch(`/product-categories/${id}`, data);
};

export const deleteProductCategory = (id: string): Promise<void> => {
  return api.delete(`/product-categories/${id}`);
};

export const restoreProductCategory = (id: string): Promise<void> => {
  return api.patch(`/product-categories/${id}/restore`);
};

export const reorderProductCategories = (orderedIds: string[]): Promise<void> => {
  return api.patch('/product-categories/reorder', { orderedIds });
};