import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 3 })
  stockQuantity: number;

  @Column()
  unit: string;

  @Column('decimal', { precision: 10, scale: 3 })
  lowStockThreshold: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0.0,
    comment: 'Costo por unidad de medida (ej. costo por kg)',
  })
  costPerUnit: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}