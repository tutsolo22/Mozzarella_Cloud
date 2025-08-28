import { QueryRunner, Repository } from 'typeorm';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { TipoMovimientoInventario } from './enums/inventory-movement-type.enum';
interface LogMovementParams {
    ingredientId: string;
    quantityChange: number;
    type: TipoMovimientoInventario;
    queryRunner: QueryRunner;
    userId?: string;
    orderId?: string;
    reason?: string;
}
export declare class InventoryMovementsService {
    private readonly movementRepository;
    constructor(movementRepository: Repository<InventoryMovement>);
    logMovement(params: LogMovementParams): Promise<void>;
}
export {};
