import { EntityManager, Repository } from 'typeorm';
import { InventoryMovement } from './entities/inventory-movement.entity';
export declare class InventoryMovementsService {
    private readonly movementRepository;
    constructor(movementRepository: Repository<InventoryMovement>);
    logMovement(movementData: Partial<InventoryMovement>, manager: EntityManager): Promise<InventoryMovement>;
    findAllForIngredient(ingredientId: string, tenantId: string): Promise<InventoryMovement[]>;
}
