import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { TipoMovimientoInventario } from '../enums/inventory-movement-type.enum';
export declare class InventoryMovement {
    id: string;
    ingredientId: string;
    ingredient: Ingredient;
    orderId?: string;
    order?: Order;
    userId?: string;
    user?: User;
    type: TipoMovimientoInventario;
    quantityChange: number;
    reason?: string;
    createdAt: Date;
}
