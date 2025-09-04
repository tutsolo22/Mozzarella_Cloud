import { InventoryMovementType } from '../enums/inventory-movement-type.enum';
export declare class LogMovementDto {
    ingredientId: string;
    quantityChange: number;
    type: InventoryMovementType;
    reason: string;
    userId?: string;
    orderId?: string;
}
