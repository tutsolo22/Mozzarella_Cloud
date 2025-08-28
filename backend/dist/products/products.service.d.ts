import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductCategory } from './entities/product-category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { ProductIngredient } from './entities/product-ingredient.entity';
import { AssignIngredientsDto } from './dto/assign-ingredients.dto';
export declare class ProductsService {
    private readonly productRepository;
    private readonly categoryRepository;
    private readonly productIngredientRepository;
    private readonly ingredientRepository;
    private readonly dataSource;
    constructor(productRepository: Repository<Product>, categoryRepository: Repository<ProductCategory>, productIngredientRepository: Repository<ProductIngredient>, ingredientRepository: Repository<Ingredient>, dataSource: DataSource);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(includeUnavailable?: boolean): Promise<Product[]>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<void>;
    assignIngredients(productId: string, assignIngredientsDto: AssignIngredientsDto): Promise<void>;
    getIngredients(productId: string): Promise<ProductIngredient[]>;
    getProductionEstimate(productId: string): Promise<{
        estimatedUnits: number;
        limitingIngredient: string;
    }>;
}
