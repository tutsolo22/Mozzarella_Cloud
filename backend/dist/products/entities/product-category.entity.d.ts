import { Product } from './product.entity';
export declare class ProductCategory {
    id: string;
    name: string;
    position: number;
    tenantId: string;
    products: Product[];
    createdAt: Date;
    updatedAt: Date;
}
