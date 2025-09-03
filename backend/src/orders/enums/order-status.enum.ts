export enum OrderStatus {
  PendingConfirmation = 'pending_confirmation',
  PendingPayment = 'pending_payment',
  Confirmed = 'confirmed',
  InPreparation = 'in_preparation',
  ReadyForExternalPickup = 'ready_for_external_pickup',
  ReadyForDelivery = 'ready_for_delivery',
  InDelivery = 'in_delivery',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}