import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesService } from '../files/files.service';
import { ProductIngredient } from './entities/product-ingredient.entity';
import { AssignIngredientsDto } from './dto/assign-ingredients.dto';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { CsvService } from '../csv/csv.service';
import { ProductCategory } from './entities/product-category.entity';
import 'multer';
export declare class ProductsService {
    private readonly productRepository;
    private readonly productIngredientRepository;
    private readonly ingredientRepository;
    private readonly categoryRepository;
    private readonly filesService;
    private readonly csvService;
    private readonly dataSource;
    private readonly logger;
    constructor(productRepository: Repository<Product>, productIngredientRepository: Repository<ProductIngredient>, ingredientRepository: Repository<Ingredient>, categoryRepository: Repository<ProductCategory>, filesService: FilesService, csvService: CsvService, dataSource: DataSource);
    create(dto: CreateProductDto, tenantId: string, locationId: string): Promise<Product>;
    findAll(tenantId: string, locationId: string, includeUnavailable: boolean): Promise<Product[]>;
    findOne(id: string, tenantId: string, locationId: string): Promise<Product>;
    update(id: string, dto: UpdateProductDto, tenantId: string, locationId: string): Promise<Product>;
    disable(id: string, tenantId: string, locationId: string): Promise<void>;
    enable(id: string, tenantId: string, locationId: string): Promise<void>;
    updateImage(id: string, file: Express.Multer.File, tenantId: string, locationId: string): Promise<Product>;
    getIngredients(id: string, tenantId: string, locationId: string): Promise<ProductIngredient[]>;
    assignIngredients(id: string, assignIngredientsDto: AssignIngredientsDto, tenantId: string, locationId: string): Promise<void>;
    exportProductsToCsv(tenantId: string): Promise<string>;
    importProductsFromCsv(file: Express.Multer.File, tenantId: string, locationId: string): Promise<{
        created: number;
        updated: number;
        errors: string[];
    }>;
}
