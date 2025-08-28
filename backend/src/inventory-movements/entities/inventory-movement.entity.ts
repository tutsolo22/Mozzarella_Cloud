import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { InventoryMovementType } from '../enums/inventory-movement-type.enum';

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  ingredientId: string;

  @Column({ nullable: true })
  userId: string; // User who performed the action

  @Column({ nullable: true })
  orderId: string;

  @Column({ type: 'enum', enum: InventoryMovementType })
  type: InventoryMovementType;

  @Column('decimal', { precision: 10, scale: 3 })
  quantityChange: number; // Can be positive (purchase) or negative (sale, waste)

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}