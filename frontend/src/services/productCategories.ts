import axiosClient from '../api/axiosClient';
import {
  ProductCategory,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from '../types/product-category';

export const getAllProductCategories = async (
  includeDeleted = false,
): Promise<ProductCategory[]> => {
  const response = await axiosClient.get('/product-categories', {
    params: { includeDeleted },
  });
  return response.data;
};

export const createProductCategory = async (
  data: CreateProductCategoryDto,
): Promise<ProductCategory> => {
  const response = await axiosClient.post('/product-categories', data);
  return response.data;
};

export const updateProductCategory = async (
  id: string,
  data: UpdateProductCategoryDto,
): Promise<ProductCategory> => {
  const response = await axiosClient.patch(`/product-categories/${id}`, data);
  return response.data;
};

export const deleteProductCategory = async (id: string): Promise<void> => {
  await axiosClient.delete(`/product-categories/${id}`);
};

export const restoreProductCategory = async (id: string): Promise<void> => {
  await axiosClient.patch(`/product-categories/${id}/restore`);
};

export const reorderProductCategories = async (orderedIds: string[]): Promise<void> => {
  await axiosClient.patch('/product-categories/reorder', { orderedIds });
};