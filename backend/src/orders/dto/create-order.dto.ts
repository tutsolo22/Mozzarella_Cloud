import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  IsNumber,
  IsDefined
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType, PaymentMethod } from '../enums/order-types.enum';
import { OrderChannel } from '../enums/order-channel.enum';


class OrderItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsEnum(OrderType)
  orderType: OrderType;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(OrderChannel)
  @IsDefined()
  channel: OrderChannel;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsNumber()
  deliveryFee?: number;
}