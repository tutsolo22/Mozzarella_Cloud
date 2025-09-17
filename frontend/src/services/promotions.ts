import axiosClient from '../api/axiosClient';
import { Promotion, CreatePromotionDto, UpdatePromotionDto } from '../types/promotion';

export const getPromotions = async (): Promise<Promotion[]> => {
  const response = await axiosClient.get('/promotions');
  return response.data;
};

export const createPromotion = async (data: CreatePromotionDto): Promise<Promotion> => {
  const response = await axiosClient.post('/promotions', data);
  return response.data;
};

export const updatePromotion = async (id: string, data: UpdatePromotionDto): Promise<Promotion> => {
  const response = await axiosClient.patch(`/promotions/${id}`, data);
  return response.data;
};

export const deletePromotion = async (id: string): Promise<void> => {
  await axiosClient.delete(`/promotions/${id}`);
};

export const uploadPromotionImage = async (id: string, file: File): Promise<Promotion> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post(`/promotions/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};