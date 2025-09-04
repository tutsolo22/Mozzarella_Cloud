import { InventoryMovementType } from '../enums/inventory-movement-type.enum';
export declare class InventoryMovement {
    id: string;
    tenantId: string;
    ingredientId: string;
    userId: string;
    orderId: string;
    type: InventoryMovementType;
    quantityChange: number;
    reason: string;
    createdAt: Date;
}
