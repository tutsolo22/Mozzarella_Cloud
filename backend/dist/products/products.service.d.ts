import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductCategory } from './entities/product-category.entity';
import { FilesService } from '../files/files.service';
import 'multer';
import { RecipeItem } from './entities/recipe-item.entity';
import { AssignIngredientsDto } from './dto/assign-ingredients.dto';
import { OrderItem } from '../orders/entities/order-item.entity';
export declare class ProductsService {
    private readonly productRepository;
    private readonly categoryRepository;
    private readonly recipeItemRepository;
    private readonly orderItemRepository;
    private readonly dataSource;
    private readonly filesService;
    constructor(productRepository: Repository<Product>, categoryRepository: Repository<ProductCategory>, recipeItemRepository: Repository<RecipeItem>, orderItemRepository: Repository<OrderItem>, dataSource: DataSource, filesService: FilesService);
    create(createProductDto: CreateProductDto, tenantId: string, locationId: string): Promise<Product>;
    findAll(tenantId: string, locationId: string, includeInactive?: boolean): Promise<Product[]>;
    findOne(id: string, tenantId: string, locationId: string): Promise<Product>;
    update(id: string, updateProductDto: UpdateProductDto, tenantId: string, locationId: string): Promise<Product>;
    disable(id: string, tenantId: string, locationId: string): Promise<void>;
    enable(id: string, tenantId: string, locationId: string): Promise<void>;
    updateImage(id: string, file: Express.Multer.File, tenantId: string, locationId: string): Promise<Product>;
    getIngredients(productId: string, tenantId: string, locationId: string): Promise<RecipeItem[]>;
    assignIngredients(productId: string, assignIngredientsDto: AssignIngredientsDto, tenantId: string, locationId: string): Promise<void>;
}
