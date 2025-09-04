import { DataSource, Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { InventoryMovementsService } from '../inventory-movements/inventory-movements.service';
import { InventoryMovement } from '../inventory-movements/entities/inventory-movement.entity';
import { PurchaseIngredientsDto } from './dto/purchase-ingredients.dto';
import { RegisterWasteDto } from './dto/register-waste.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
export declare class IngredientsService {
    private readonly ingredientRepository;
    private readonly movementRepository;
    private readonly inventoryMovementsService;
    private readonly dataSource;
    constructor(ingredientRepository: Repository<Ingredient>, movementRepository: Repository<InventoryMovement>, inventoryMovementsService: InventoryMovementsService, dataSource: DataSource);
    create(createIngredientDto: CreateIngredientDto, tenantId: string): Promise<Ingredient>;
    findAll(tenantId: string): Promise<Ingredient[]>;
    findOne(id: string, tenantId: string): Promise<Ingredient>;
    update(id: string, updateIngredientDto: UpdateIngredientDto, tenantId: string): Promise<Ingredient>;
    remove(id: string, tenantId: string): Promise<void>;
    purchase(purchaseDto: PurchaseIngredientsDto, userId: string, tenantId: string): Promise<void>;
    registerWaste(registerWasteDto: RegisterWasteDto, userId: string, tenantId: string): Promise<void>;
    adjustStock(adjustStockDto: AdjustStockDto, userId: string, tenantId: string): Promise<void>;
    getMovementHistory(ingredientId: string, tenantId: string): Promise<InventoryMovement[]>;
    getWasteReport(tenantId: string, locationId: string, queryDto: {
        startDate?: string;
        endDate?: string;
    }): Promise<{}>;
}
