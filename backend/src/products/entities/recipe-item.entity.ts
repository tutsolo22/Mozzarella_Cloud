import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Entity('recipe_items')
@Index(['productId', 'ingredientId'], { unique: true })
export class RecipeItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid' })
  ingredientId: string;

  @Column('decimal', { precision: 10, scale: 3 })
  quantityRequired: number;

  @ManyToOne(() => Product, (product) => product.recipeItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipeItems, { eager: true })
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;
}