import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PaymentMethod } from '../../orders/enums/order-types.enum';

@Entity('tenant_configurations')
export class TenantConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  tenantId: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'API Key for OpenRouteService (Directions)',
  })
  directionsApiKey?: string;

  @Column({
    type: 'double precision',
    nullable: true,
    comment: 'Latitud de la ubicación base del restaurante',
  })
  restaurantLatitude?: number;

  @Column({
    type: 'double precision',
    nullable: true,
    comment: 'Longitud de la ubicación base del restaurante',
  })
  restaurantLongitude?: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'API Key for OpenCage (Geocoding)',
  })
  openCageApiKey?: string;

  @Column({ nullable: true })
  mercadoPagoAccessToken?: string;

  @Column({
    type: 'simple-array',
    nullable: true,
    comment: 'Payment methods enabled for this tenant (e.g., cash, mercado_pago)',
    default: 'cash',
  })
  enabledPaymentMethods?: PaymentMethod[];
}