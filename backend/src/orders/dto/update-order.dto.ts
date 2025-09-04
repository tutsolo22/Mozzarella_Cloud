import { IsEnum, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/order-types.enum';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsUUID()
  assignedDriverId?: string;

  @IsOptional()
  @IsUrl()
  paymentLink?: string;

  @IsOptional()
  @IsString()
  paymentGatewayId?: string;
}