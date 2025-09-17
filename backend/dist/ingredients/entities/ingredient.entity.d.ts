import { Tenant } from '../../tenants/entities/tenant.entity';
import { Location } from '../../locations/entities/location.entity';
import { ProductIngredient } from '../../products/entities/product-ingredient.entity';
import { RecipeItem } from '../../products/entities/recipe-item.entity';
export declare class Ingredient {
    id: string;
    name: string;
    stockQuantity: number;
    unit: string;
    lowStockThreshold: number;
    costPerUnit: number;
    tenantId: string;
    tenant: Tenant;
    locationId: string;
    location: Location;
    productIngredients: ProductIngredient[];
    recipeItems: RecipeItem[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
