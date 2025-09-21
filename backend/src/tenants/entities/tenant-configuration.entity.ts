import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tenant_configurations')
export class TenantConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @OneToOne(() => Tenant, tenant => tenant.configuration)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'varchar', length: 255, nullable: true })
  slogan?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contactPhone?: string;

  @Column({ type: 'text', nullable: true })
  fiscalAddress?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  logoUrl?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  logoDarkUrl?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  faviconUrl?: string;

  @Column({ type: 'varchar', length: 13, nullable: true })
  rfc?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  businessName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  taxRegime?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  facebookUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  instagramUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tiktokUrl?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  primaryPrinterIp?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  secondaryPrinterIp?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  kdsNotificationSoundUrl?: string;

  @Column({ type: 'double precision', nullable: true })
  restaurantLatitude?: number;

  @Column({ type: 'double precision', nullable: true })
  restaurantLongitude?: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'API Key for route optimization services' })
  directionsApiKey?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'API Key for geocoding services' })
  openCageApiKey?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Access Token for Mercado Pago' })
  mercadoPagoAccessToken?: string;

  @Column({ type: 'simple-array', nullable: true, comment: 'List of enabled payment methods' })
  enabledPaymentMethods?: string[];

  // Using 'geography' type for PostGIS support.
  // The 'any' type is for TypeORM's representation.
  @Column({ type: 'geography', spatialFeatureType: 'Polygon', srid: 4326, nullable: true, comment: 'Área de entrega a nivel de tenant (fallback)' })
  deliveryArea: any;

  // --- Nuevos Campos para Integración de Facturación Externa ---
  @Column({ type: 'varchar', length: 512, nullable: true, comment: 'URL de la aplicación de facturación para que el usuario acceda.' })
  invoicingAppUrl?: string;
}