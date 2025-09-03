import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('cashier_sessions')
export class CashierSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'openedByUserId' })
  openedByUser: User;

  @Column()
  openedByUserId: string;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'closedByUserId' })
  closedByUser?: User;

  @Column({ nullable: true })
  closedByUserId?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  openedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  closedAt?: Date;

  @Column('decimal', { precision: 10, scale: 2, comment: 'Dinero en caja al abrir' })
  openingBalance: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, comment: 'Dinero contado en caja al cerrar' })
  closingBalance?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, comment: 'Total de ventas durante la sesión' })
  totalSales?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, comment: 'Ventas calculadas en efectivo' })
  calculatedCash?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, comment: 'Ventas calculadas con tarjeta' })
  calculatedCard?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, comment: 'Ventas calculadas con otros métodos' })
  calculatedOther?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, comment: 'Diferencia entre contado y calculado' })
  difference?: number;

  @Column('text', { nullable: true })
  notes?: string;

  @UpdateDateColumn()
  updatedAt: Date;
}