import { InventoryMovement } from '../../inventory-movements/entities/inventory-movement.entity';
import { ProductIngredient } from '../../products/entities/product-ingredient.entity';
export declare class Ingredient {
    id: string;
    name: string;
    stockQuantity: number;
    unit: string;
    lowStockThreshold: number;
    productConnections: ProductIngredient[];
    movements: InventoryMovement[];
    createdAt: Date;
    updatedAt: Date;
}
