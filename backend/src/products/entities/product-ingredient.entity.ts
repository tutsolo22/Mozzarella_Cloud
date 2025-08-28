import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Entity('product_ingredients')
export class ProductIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantityRequired: number;

  @ManyToOne(() => Product, (product) => product.ingredients, { onDelete: 'CASCADE' })
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.productConnections)
  ingredient: Ingredient;

  @Column()
  ingredientId: string;
}