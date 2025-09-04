import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { InventoryMovementType } from '../enums/inventory-movement-type.enum';

export class LogMovementDto {
  @IsUUID()
  ingredientId: string;

  @IsNumber()
  quantityChange: number;

  @IsEnum(InventoryMovementType)
  type: InventoryMovementType;

  @IsString()
  reason: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsUUID()
  @IsOptional()
  orderId?: string;
}