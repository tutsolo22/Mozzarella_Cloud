import { Product } from './product';

export type OrderStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'in_preparation'
  | 'ready_for_delivery'
  | 'in_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

export interface CreateOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}