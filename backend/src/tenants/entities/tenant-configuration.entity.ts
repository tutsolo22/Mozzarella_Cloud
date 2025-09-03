import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PaymentMethod } from '../../orders/enums/order-types.enum';

@Entity('tenant_configurations')
export class TenantConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  kdsNotificationSoundUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  deliveryZone?: any; // GeoJSON Polygon

  @Column({ nullable: true })
  directionsApiKey?: string; // For OpenRouteService

  @Column({ nullable: true })
  apiKeyGeocoding?: string; // For OpenCage

  @Column({ nullable: true })
  mercadoPagoAccessToken?: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    array: true,
    default: [PaymentMethod.Cash],
  })
  enabledPaymentMethods: PaymentMethod[];
}