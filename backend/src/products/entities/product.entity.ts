import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { PreparationZone } from '../../preparation-zones/entities/preparation-zone.entity';
import { RecipeItem } from './recipe-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: false })
  recipeIsSet: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0, comment: 'Peso del producto en kg' })
  weightKg: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0, comment: 'Volumen del producto en m³' })
  volumeM3: number;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  locationId: string;

  @Column()
  categoryId: string;

  @ManyToOne(() => ProductCategory, (category) => category.products, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: ProductCategory;

  @Column({ type: 'uuid', nullable: true })
  preparationZoneId: string | null;

  @ManyToOne(() => PreparationZone, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'preparationZoneId' })
  preparationZone: PreparationZone;

  @OneToMany(() => RecipeItem, (item) => item.product)
  ingredients: RecipeItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}