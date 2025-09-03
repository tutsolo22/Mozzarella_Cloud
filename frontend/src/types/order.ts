import { Product } from './product';

export enum DeliveryProviderType {
  InHouse = 'in_house',
  External = 'external',
}

export enum OrderStatus {
  PendingConfirmation = 'pending_confirmation',
  Confirmed = 'confirmed',
  InPreparation = 'in_preparation',
  ReadyForExternalPickup = 'ready_for_external_pickup',
  ReadyForDelivery = 'ready_for_delivery',
  InDelivery = 'in_delivery',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

export type OrderType = 'delivery' | 'pickup' | 'dine_in';
export enum PaymentMethod {
  Cash = 'cash',
  Transfer = 'transfer',
  DebitCard = 'debit_card',
  CreditCard = 'credit_card',
}
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  product: Product;
  productId: string;
  quantity: number;
  unitPrice: string; // Los decimales del backend a menudo se serializan como strings
  notes?: string;
}

export interface Order {
  id: string;
  shortId: string;
  status: OrderStatus;
  orderType: OrderType;
  totalAmount: string; // Los decimales del backend a menudo se serializan como strings
  items: OrderItem[];
  deliveryAddress?: string;
  latitude?: number;
  longitude?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  preparationTimeMinutes?: number | null;
  estimatedDeliveryAt?: string | null;
  assignedAt?: string | null;
  estimatedPickupArrivalAt?: string | null;
  pickupNotificationSent?: boolean;
  isPriority?: boolean;
  deliveryProvider: DeliveryProviderType;
  externalDeliveryProvider?: string;
  deliveryFee: string;
  deliveredAt?: string | null;
  customer?: {
    id: string;
    fullName: string;
  };
  assignedDriver?: {
    id: string;
    fullName: string;
  };
  deliverySequence?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}