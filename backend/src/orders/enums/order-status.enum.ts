export enum OrderStatus {
  PendingConfirmation = 'pending_confirmation',
  Confirmed = 'confirmed',
  InPreparation = 'in_preparation',
  ReadyForDelivery = 'ready_for_delivery',
  InDelivery = 'in_delivery',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}