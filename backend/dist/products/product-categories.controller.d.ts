import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { UserPayload } from '../auth/decorators/user.decorator';
export declare class ProductCategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: ProductCategoriesService);
    create(createDto: CreateProductCategoryDto, user: UserPayload): Promise<import("./entities/product-category.entity").ProductCategory>;
    findAll(user: UserPayload, includeDeleted?: boolean): Promise<import("./entities/product-category.entity").ProductCategory[]>;
    update(id: string, updateDto: UpdateProductCategoryDto, user: UserPayload): Promise<import("./entities/product-category.entity").ProductCategory>;
    remove(id: string, user: UserPayload): Promise<void>;
    restore(id: string, user: UserPayload): Promise<void>;
    reorder(reorderDto: ReorderCategoriesDto, user: UserPayload): Promise<void>;
}
