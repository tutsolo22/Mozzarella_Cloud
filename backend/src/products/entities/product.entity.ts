import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Location } from '../../locations/entities/location.entity';
import { ProductCategory } from '../../products/entities/product-category.entity';
import { PreparationZone } from '../../preparation-zones/entities/preparation-zone.entity';
import { ProductIngredient } from './product-ingredient.entity';
import { RecipeItem } from './recipe-item.entity';

@Entity('products')
@Index(['tenantId', 'locationId', 'name'], { unique: true, where: '"deletedAt" IS NULL' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true }) // Corrected: Removed duplicate @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: false })
  recipeIsSet: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  weightKg: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  volumeM3: number;

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
  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => ProductCategory, { onDelete: 'SET NULL', nullable: true }) // Corrected: Removed duplicate @ManyToOne
  @JoinColumn({ name: 'categoryId' })
  category: ProductCategory;

  @Column({ nullable: true })
  preparationZoneId: string;

  @ManyToOne(() => PreparationZone, { onDelete: 'SET NULL', nullable: true }) // Corrected: Removed duplicate @ManyToOne
  @JoinColumn({ name: 'preparationZoneId' })
  preparationZone: PreparationZone;

  @OneToMany(() => ProductIngredient, (pi) => pi.product, {
    cascade: true,
    eager: true,
  })
  ingredients: ProductIngredient[];

  @OneToMany(() => RecipeItem, (item) => item.product)
  recipeItems: RecipeItem[];

  // --- Nuevos Campos para Facturación (SAT) ---

  @Column({ type: 'varchar', length: 10, nullable: true, comment: 'Clave de Producto o Servicio del catálogo del SAT' })
  satProductKey?: string;

  @Column({ type: 'varchar', length: 5, nullable: true, comment: 'Clave de Unidad de Medida del catálogo del SAT' })
  satUnitKey?: string;

  @Column({ default: true, comment: 'Indica si el producto causa impuestos (IVA)' })
  isTaxable: boolean;

  // --- Fin de Nuevos Campos ---
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}