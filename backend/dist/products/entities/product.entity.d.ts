import { ProductCategory } from './product-category.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { PreparationZone } from '../../preparation-zones/entities/preparation-zone.entity';
import { RecipeItem } from './recipe-item.entity';
export declare class Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    isAvailable: boolean;
    recipeIsSet: boolean;
    weightKg: number;
    volumeM3: number;
    tenantId: string;
    tenant: Tenant;
    locationId: string;
    categoryId: string;
    category: ProductCategory;
    preparationZoneId: string | null;
    preparationZone: PreparationZone;
    ingredients: RecipeItem[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
