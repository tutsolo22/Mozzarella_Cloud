import { QueryRunner } from 'typeorm';
import { TipoMovimientoInventario } from '../enums/inventory-movement-type.enum';

export class LogMovementDto {
  ingredientId: string;
  quantityChange: number;
  type: TipoMovimientoInventario;
  reason: string;
  tenantId: string;
  userId?: string;
  orderId?: string;
  queryRunner: QueryRunner;
}