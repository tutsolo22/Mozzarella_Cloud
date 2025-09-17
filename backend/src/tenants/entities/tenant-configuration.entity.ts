import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tenant_configurations')
export class TenantConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @OneToOne(() => Tenant, (tenant) => tenant.configuration, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'jsonb', nullable: true })
  deliveryArea: any; // GeoJSON Polygon

  @Column({ nullable: true })
  kdsNotificationSoundUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  restaurantLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  restaurantLongitude: number;

  @Column({ nullable: true })
  directionsApiKey: string;

  @Column({ nullable: true })
  openCageApiKey: string;

  @Column({ nullable: true, select: false })
  mercadoPagoAccessToken: string;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  enabledPaymentMethods: string[];
}