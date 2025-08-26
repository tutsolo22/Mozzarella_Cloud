import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Point } from 'geojson';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from './order-status.enum';
import { OrderType } from './order-type.enum';
import { PaymentStatus } from './payment-status.enum';
import { PaymentMethod } from './payment-method.enum';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'short_id', type: 'varchar', unique: true, nullable: false })
  shortId: string;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    nullable: false,
  })
  status: OrderStatus;

  @Column({
    name: 'order_type',
    type: 'enum',
    enum: OrderType,
    nullable: false,
  })
  orderType: OrderType;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalAmount: number;

  @Column({ name: 'delivery_address', type: 'text', nullable: false })
  deliveryAddress: string;

  @Column({
    name: 'delivery_location',
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326, // Standard WGS 84 para coordenadas GPS
    nullable: true, // Puede ser nulo para pedidos que no son a domicilio
  })
  deliveryLocation: Point;

  @Column({ name: 'assigned_driver_id', type: 'uuid', nullable: true })
  assignedDriverId: string;

  @ManyToOne(() => User, (user) => user.assignedOrders, { nullable: true })
  @JoinColumn({ name: 'assigned_driver_id' })
  assignedDriver: User;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    nullable: false,
  })
  paymentStatus: PaymentStatus;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}