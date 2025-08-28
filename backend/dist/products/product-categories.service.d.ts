import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
export declare class ProductCategoriesService {
    private readonly categoryRepository;
    constructor(categoryRepository: Repository<ProductCategory>);
    create(createDto: CreateProductCategoryDto): Promise<ProductCategory>;
    findAll(): Promise<ProductCategory[]>;
    update(id: string, updateDto: UpdateProductCategoryDto): Promise<ProductCategory>;
    remove(id: string): Promise<void>;
}
