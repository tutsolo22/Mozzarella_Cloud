export enum OrderStatus {
  PendingConfirmation = 'pending_confirmation',
  Confirmed = 'confirmed',
  InPreparation = 'in_preparation',
  ReadyForDelivery = 'ready_for_delivery',
  ReadyForExternalPickup = 'ready_for_external_pickup',
  InDelivery = 'in_delivery',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
  PendingPayment = 'pending_payment',
}