import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/order-types.enum';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsUUID()
  assignedDriverId?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  paymentGatewayId?: string;

  @IsOptional()
  @IsUrl()
  paymentLink?: string;

  @IsOptional()
  @IsBoolean()
  isBilled?: boolean;

  @IsOptional()
  @IsUrl()
  invoiceUrl?: string;
}