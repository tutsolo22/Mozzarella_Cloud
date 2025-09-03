export enum OrderType {
  Delivery = 'delivery',
  Pickup = 'pickup',
  DineIn = 'dine_in',
}

export enum PaymentMethod {
  Cash = 'cash',
  Transfer = 'transfer',
  DebitCard = 'debit_card',
  CreditCard = 'credit_card',
  MercadoPago = 'mercado_pago',
}

export enum PaymentStatus {
  Pending = 'pending',
  Paid = 'paid',
  Failed = 'failed',
  Refunded = 'refunded',
}