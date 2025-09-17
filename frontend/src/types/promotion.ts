import { Product } from './product';

export interface Promotion {
  id: string;
  name: string;
  description: string;
  discountPercentage?: number | null;
  isActive: boolean;
  imageUrl?: string | null;
  startDate: string;
  endDate: string;
  products: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionDto {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  productIds: string[];
  discountPercentage?: number;
  isActive?: boolean;
}

export type UpdatePromotionDto = Partial<CreatePromotionDto>;