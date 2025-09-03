import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import {
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from '../enums/order-types.enum';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Location } from '../../locations/entities/location.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { customAlphabet } from 'nanoid';

export enum DeliveryProviderType {
  InHouse = 'in_house',
  External = 'external',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 9, unique: true })
  shortId: string;

  @Column({ comment: 'ID del tenant al que pertenece el pedido' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ comment: 'ID de la sucursal que procesa el pedido' })
  locationId: string;

  @ManyToOne(() => Location, location => location.orders)
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column({ type: 'uuid', nullable: true })
  customerId?: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'assignedDriverId' })
  assignedDriver?: User;

  @Column({ type: 'uuid', nullable: true })
  assignedDriverId?: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PendingConfirmation,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderType,
    default: OrderType.Delivery,
  })
  orderType: OrderType;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', {
    precision: 10,
    scale: 3,
    default: 0,
    comment: 'Peso total del pedido en kg',
  })
  totalWeightKg: number;

  @Column('decimal', {
    precision: 10,
    scale: 6,
    default: 0,
    comment: 'Volumen total del pedido en m³',
  })
  totalVolumeM3: number;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  deliveryAddress?: string;

  @Column({ type: 'double precision', nullable: true })
  latitude?: number;

  @Column({ type: 'double precision', nullable: true })
  longitude?: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.Cash,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.Pending,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'ID de la transacción en la pasarela de pago' })
  paymentGatewayId?: string;

  @Column({ type: 'varchar', length: 512, nullable: true, comment: 'URL del link de pago generado' })
  paymentLink?: string;

  @Column({
    type: 'integer',
    nullable: true,
    comment: 'Tiempo de preparación en minutos',
  })
  preparationTimeMinutes: number | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Hora de entrega estimada para el cliente',
  })
  estimatedDeliveryAt: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Hora en que se asignó el repartidor',
  })
  assignedAt: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Hora en que el pedido fue realmente entregado',
  })
  deliveredAt: Date | null;

  @Column({ type: 'integer', nullable: true })
  deliverySequence?: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Indica si se ha enviado la notificación de proximidad del repartidor al KDS',
  })
  pickupNotificationSent: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'Hora estimada en que el repartidor llegará a recoger el pedido',
  })
  estimatedPickupArrivalAt: Date | null;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Indica si el pedido tiene prioridad de entrega',
  })
  isPriority: boolean;

  @Column({
    type: 'enum',
    enum: DeliveryProviderType,
    default: DeliveryProviderType.InHouse,
    comment: 'Indica si la entrega es con repartidor propio o externo',
  })
  deliveryProvider: DeliveryProviderType;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Nombre del proveedor externo (ej. Uber Eats)' })
  externalDeliveryProvider?: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    comment: 'Costo del envío, si aplica',
  })
  deliveryFee: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateShortId() {
    // Generates a short, human-readable ID like 'A1B2-C3D4'
    const nanoid = customAlphabet(
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      8,
    );
    this.shortId = nanoid().replace(/(\w{4})/, '$1-');
  }
}