import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsArray,
  ValidateNested,
  IsUUID,
  IsInt,
  Min,
  IsEnum,
  IsOptional, ValidateIf,
} from 'class-validator';
import { OrderType } from '../../enums/order-type.enum';
import { PaymentMethod } from '../../orders/enums/order-types.enum';

class WhatsappOrderItemDto {
  @IsUUID('4')
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateWhatsappOrderDto {
  @IsPhoneNumber()
  customerPhone: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ValidateIf(o => o.orderType === OrderType.Delivery)
  @IsNotEmpty({ message: 'La dirección de entrega es obligatoria para pedidos a domicilio.' })
  @IsString()
  deliveryAddress?: string;

  @IsEnum(OrderType)
  orderType: OrderType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsappOrderItemDto)
  items: WhatsappOrderItemDto[];

  @IsUUID('4')
  locationId: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}