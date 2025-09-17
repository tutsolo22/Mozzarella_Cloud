import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Location } from '../../locations/entities/location.entity';
import { ProductIngredient } from '../../products/entities/product-ingredient.entity';
import { RecipeItem } from '../../products/entities/recipe-item.entity';

@Entity('ingredients')
@Index(['tenantId', 'locationId', 'name'], { unique: true, where: '"deletedAt" IS NULL' })
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  stockQuantity: number;

  @Column()
  unit: string; // e.g., kg, liter, unit

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  lowStockThreshold: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  costPerUnit: number;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  locationId: string;

  @ManyToOne(() => Location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @OneToMany(
    () => ProductIngredient,
    (productIngredient) => productIngredient.ingredient,
  )
  productIngredients: ProductIngredient[];

  @OneToMany(() => RecipeItem, (recipeItem) => recipeItem.ingredient)
  recipeItems: RecipeItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}