import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { PurchaseIngredientsDto } from './dto/purchase-ingredients.dto';
import { RegisterWasteDto } from './dto/register-waste.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { UserPayload } from '../auth/decorators/user.decorator';
export declare class IngredientsController {
    private readonly ingredientsService;
    constructor(ingredientsService: IngredientsService);
    create(createIngredientDto: CreateIngredientDto, user: UserPayload): Promise<import("./entities/ingredient.entity").Ingredient>;
    findAll(user: UserPayload): Promise<import("./entities/ingredient.entity").Ingredient[]>;
    purchase(purchaseDto: PurchaseIngredientsDto, user: UserPayload): Promise<void>;
    registerWaste(wasteDto: RegisterWasteDto, user: UserPayload): Promise<void>;
    adjustStock(adjustDto: AdjustStockDto, user: UserPayload): Promise<void>;
    getMovementHistory(id: string, user: UserPayload): Promise<import("../inventory-movements/entities/inventory-movement.entity").InventoryMovement[]>;
}
