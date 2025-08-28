import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { ProductIngredient } from './product-ingredient.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: false })
  recipeIsSet: boolean;

  @ManyToOne(() => ProductCategory, { nullable: true, eager: true })
  category: ProductCategory;

  @Column({ nullable: true })
  categoryId: string;

  @OneToMany(() => ProductIngredient, (pi) => pi.product)
  ingredients: ProductIngredient[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}