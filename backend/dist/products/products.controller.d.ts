import 'multer';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AssignIngredientsDto } from './dto/assign-ingredients.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserPayload } from '../auth/decorators/user.decorator';
import { Response } from 'express';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, user: UserPayload): Promise<import("./entities/product.entity").Product>;
    findAll(user: UserPayload, includeUnavailable: boolean): Promise<import("./entities/product.entity").Product[]>;
    findOne(id: string, user: UserPayload): Promise<import("./entities/product.entity").Product>;
    update(id: string, updateProductDto: UpdateProductDto, user: UserPayload): Promise<import("./entities/product.entity").Product>;
    remove(id: string, user: UserPayload): Promise<void>;
    restore(id: string, user: UserPayload): Promise<void>;
    uploadImage(id: string, file: Express.Multer.File, user: UserPayload): Promise<import("./entities/product.entity").Product>;
    getIngredients(id: string, user: UserPayload): Promise<import("./entities/product-ingredient.entity").ProductIngredient[]>;
    assignIngredients(id: string, assignIngredientsDto: AssignIngredientsDto, user: UserPayload): Promise<void>;
    exportProducts(user: UserPayload, res: Response): Promise<Response<any, Record<string, any>>>;
    importProducts(file: Express.Multer.File, user: UserPayload): Promise<{
        created: number;
        updated: number;
        errors: string[];
    }>;
}
