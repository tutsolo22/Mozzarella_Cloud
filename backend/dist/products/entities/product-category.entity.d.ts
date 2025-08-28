import { Product } from './product.entity';
export declare class ProductCategory {
    id: string;
    name: string;
    description: string;
    products: Product[];
    createdAt: Date;
    updatedAt: Date;
}
