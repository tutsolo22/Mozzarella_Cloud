import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
export declare class ProductCategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: ProductCategoriesService);
    create(createDto: CreateProductCategoryDto): Promise<import("./entities/product-category.entity").ProductCategory>;
    findAll(): Promise<import("./entities/product-category.entity").ProductCategory[]>;
    update(id: string, updateDto: UpdateProductCategoryDto): Promise<import("./entities/product-category.entity").ProductCategory>;
    remove(id: string): Promise<void>;
}
