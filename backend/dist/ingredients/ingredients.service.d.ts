import { DataSource, Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { PurchaseIngredientsDto } from './dto/purchase-ingredients.dto';
import { InventoryMovementsService } from 'src/inventory-movements/inventory-movements.service';
import { RegisterWasteDto } from './dto/register-waste.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { InventoryMovement } from 'src/inventory-movements/entities/inventory-movement.entity';
import { WasteReportQueryDto } from './dto/waste-report-query.dto';
export declare class IngredientsService {
    private readonly ingredientRepository;
    private readonly movementRepository;
    private readonly inventoryMovementsService;
    private readonly dataSource;
    constructor(ingredientRepository: Repository<Ingredient>, movementRepository: Repository<InventoryMovement>, inventoryMovementsService: InventoryMovementsService, dataSource: DataSource);
    create(createIngredientDto: CreateIngredientDto): Promise<Ingredient>;
    findAll(): Promise<Ingredient[]>;
    findOne(id: string): Promise<Ingredient>;
    update(id: string, updateIngredientDto: UpdateIngredientDto): Promise<Ingredient>;
    remove(id: string): Promise<void>;
    purchase(purchaseDto: PurchaseIngredientsDto, userId: string): Promise<void>;
    registerWaste(registerWasteDto: RegisterWasteDto, userId: string): Promise<void>;
    getMovementHistory(ingredientId: string): Promise<InventoryMovement[]>;
    adjustStock(adjustStockDto: AdjustStockDto, userId: string): Promise<void>;
    getWasteReport(queryDto: WasteReportQueryDto): Promise<{
        reportPeriod: {
            from: string;
            to: string;
        };
        totalWasteEntries: number;
        summary: {
            totalQuantity: number;
            ingredientName: string;
            unit: string;
            entries: number;
            ingredientId: string;
        }[];
        details: InventoryMovement[];
    }>;
}
