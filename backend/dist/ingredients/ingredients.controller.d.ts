import { UserPayload } from 'src/auth/decorators/user.decorator';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { PurchaseIngredientsDto } from './dto/purchase-ingredients.dto';
import { RegisterWasteDto } from './dto/register-waste.dto';
import { WasteReportQueryDto } from './dto/waste-report-query.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
export declare class IngredientsController {
    private readonly ingredientsService;
    constructor(ingredientsService: IngredientsService);
    purchase(purchaseIngredientsDto: PurchaseIngredientsDto, user: UserPayload): Promise<void>;
    registerWaste(registerWasteDto: RegisterWasteDto, user: UserPayload): Promise<void>;
    adjustStock(adjustStockDto: AdjustStockDto, user: UserPayload): Promise<void>;
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
        details: import("../inventory-movements/entities/inventory-movement.entity").InventoryMovement[];
    }>;
    create(createIngredientDto: CreateIngredientDto): Promise<import("./entities/ingredient.entity").Ingredient>;
    findAll(): Promise<import("./entities/ingredient.entity").Ingredient[]>;
    findOne(id: string): Promise<import("./entities/ingredient.entity").Ingredient>;
    update(id: string, updateIngredientDto: UpdateIngredientDto): Promise<import("./entities/ingredient.entity").Ingredient>;
    remove(id: string): Promise<void>;
    getMovementHistory(id: string): Promise<import("../inventory-movements/entities/inventory-movement.entity").InventoryMovement[]>;
}
