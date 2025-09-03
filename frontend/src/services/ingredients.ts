import api from '../api/axiosClient';
import { Ingredient, CreateIngredientDto } from '../types/product';
import { InventoryMovement } from '../types/inventory';

export const getIngredients = (): Promise<Ingredient[]> => {
  return api.get('/ingredients');
};

export const createIngredient = (data: CreateIngredientDto): Promise<Ingredient> => {
  return api.post('/ingredients', data);
};

export const updateIngredient = (id: string, data: Partial<CreateIngredientDto>): Promise<Ingredient> => {
  return api.patch(`/ingredients/${id}`, data);
};

export const deleteIngredient = (id: string): Promise<void> => {
  return api.delete(`/ingredients/${id}`);
};

export const exportIngredients = (): Promise<string> => {
  return api.get('/ingredients/export');
};

export const importIngredients = (file: File): Promise<{ created: number; updated: number; errors: any[] }> => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/ingredients/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const registerWaste = (
  items: { ingredientId: string; quantity: number; reason?: string }[],
): Promise<void> => {
  return api.post('/ingredients/waste', { items });
};

export const adjustStock = (
  items: { ingredientId: string; newQuantity: number; reason: string }[],
): Promise<void> => {
  return api.post('/ingredients/adjust-stock', { items });
};

export const getIngredientMovements = (ingredientId: string): Promise<InventoryMovement[]> => {
  return api.get(`/ingredients/${ingredientId}/movements`);
};