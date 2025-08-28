import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Entity('recipe_items')
export class RecipeItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 3 })
  quantityRequired: number;

  @Column()
  productId: string;

  @Column()
  ingredientId: string;

  @ManyToOne(() => Product, (product) => product.ingredients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipeItems, { eager: true })
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;
}