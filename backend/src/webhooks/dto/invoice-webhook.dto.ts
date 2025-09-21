import { IsString, IsNotEmpty, IsUrl, IsOptional, IsEnum } from 'class-validator';

export enum InvoiceWebhookStatus {
  INVOICED = 'invoiced',
  CANCELLED = 'cancelled',
  ERROR = 'error',
}

export class InvoiceWebhookPayload {
  @IsString()
  @IsNotEmpty()
  internalOrderId: string; // Our internal Order ID

  @IsString()
  @IsNotEmpty()
  externalOrderId: string; // The ID from the invoicing system

  @IsEnum(InvoiceWebhookStatus)
  status: InvoiceWebhookStatus;

  @IsUrl()
  @IsOptional()
  invoiceUrl?: string; // URL to the PDF/XML of the invoice
}