import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Position } from './position.entity';

export enum PaymentFrequency {
  Daily = 'daily',
  Weekly = 'weekly',
  BiWeekly = 'bi-weekly',
  Monthly = 'monthly',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @ManyToOne(() => Position, { eager: true, nullable: false })
  @JoinColumn({ name: 'positionId' })
  position: Position;

  @Column({ type: 'uuid' })
  positionId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  salary: number;

  @Column({ type: 'enum', enum: PaymentFrequency, default: PaymentFrequency.Monthly })
  paymentFrequency: PaymentFrequency;

  @Column({ type: 'date' })
  hireDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}