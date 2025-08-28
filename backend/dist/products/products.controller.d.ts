import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AssignIngredientsDto } from './dto/assign-ingredients.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<import("./entities/product.entity").Product>;
    findAll(includeUnavailable?: string): Promise<import("./entities/product.entity").Product[]>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<import("./entities/product.entity").Product>;
    remove(id: string): Promise<void>;
    getIngredients(productId: string): Promise<import("./entities/product-ingredient.entity").ProductIngredient[]>;
    assignIngredients(productId: string, assignIngredientsDto: AssignIngredientsDto): Promise<void>;
    getProductionEstimate(productId: string): Promise<{
        estimatedUnits: number;
        limitingIngredient: string;
    }>;
}
