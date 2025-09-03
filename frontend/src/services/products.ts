import api from '../api/axiosClient';
import { Product, CreateProductDto, UpdateProductDto, RecipeItem } from '../types/product';

export const getProducts = (includeInactive = false): Promise<Product[]> => {
  return api.get('/products', {
    params: { includeUnavailable: includeInactive },
  });
};

export const createProduct = async (data: CreateProductDto): Promise<Product> => {
  const response = await api.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: string, data: UpdateProductDto): Promise<Product> => {
  const response = await api.patch(`/products/${id}`, data);
  return response.data;
};

export const disableProduct = async (id: string): Promise<void> => {
  return api.delete(`/products/${id}`);
};

export const enableProduct = async (id: string): Promise<void> => {
  return api.patch(`/products/${id}/restore`);
};

export const getProductRecipe = (productId: string): Promise<RecipeItem[]> => {
  return api.get(`/products/${productId}/ingredients`);
};

export const assignProductRecipe = (
  productId: string,
  ingredients: { ingredientId: string; quantityRequired: number }[],
): Promise<void> => {
  return api.post(`/products/${productId}/ingredients`, { ingredients });
};


export const exportProducts = (): Promise<string> => {
  return api.get('/products/export');
};

export const importProducts = (file: File): Promise<{ created: number; updated: number; errors: any[] }> => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/products/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};