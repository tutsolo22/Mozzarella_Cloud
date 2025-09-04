import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { Product } from './entities/product.entity';
export declare class ProductCategoriesService {
    private readonly categoryRepository;
    private readonly productRepository;
    constructor(categoryRepository: Repository<ProductCategory>, productRepository: Repository<Product>);
    create(createDto: CreateProductCategoryDto, tenantId: string): Promise<ProductCategory>;
    findAll(tenantId: string, includeDeleted?: boolean): Promise<ProductCategory[]>;
    findOne(id: string, tenantId: string): Promise<ProductCategory>;
    update(id: string, updateDto: UpdateProductCategoryDto, tenantId: string): Promise<ProductCategory>;
    remove(id: string, tenantId: string): Promise<void>;
    restore(id: string, tenantId: string): Promise<void>;
    reorder(orderedIds: string[], tenantId: string): Promise<void>;
}
