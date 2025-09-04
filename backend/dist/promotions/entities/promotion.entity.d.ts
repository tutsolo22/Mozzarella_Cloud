import { Product } from '../../products/entities/product.entity';
export declare class Promotion {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    startDate: Date;
    endDate: Date;
    tenantId: string;
    products: Product[];
    createdAt: Date;
    updatedAt: Date;
}
