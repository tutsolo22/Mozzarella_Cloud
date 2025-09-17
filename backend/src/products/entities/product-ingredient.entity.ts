import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Entity('product_ingredients')
export class ProductIngredient {
  @PrimaryColumn()
  productId: string;

  @PrimaryColumn()
  ingredientId: string;

  @ManyToOne(() => Product, (product) => product.ingredients, {
    onDelete: 'CASCADE', // Corrected: Removed 'primary: true'
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.productIngredients, {
    eager: true, // Corrected: Removed 'primary: true'
    onDelete: 'CASCADE', 
  })
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;

  @Column('decimal', { precision: 10, scale: 3 })
  quantityRequired: number;
}