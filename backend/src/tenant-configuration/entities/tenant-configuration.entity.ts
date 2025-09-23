import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('tenant_configurations')
export class TenantConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @OneToOne(() => Tenant, tenant => tenant.configuration)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 100 })
  businessName: string;

  @Column({ length: 100, nullable: true })
  legalName?: string;

  @Column({ length: 13, nullable: true })
  rfc?: string;

  @Column({ length: 100, nullable: true })
  taxRegime?: string;

  @Column({ type: 'text', nullable: true })
  taxAddress?: string;

  @Column({ length: 100 })
  contactEmail: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contactPhone?: string;

  // --- Nuevos Campos ---

  @Column({ length: 15, nullable: true, comment: 'Teléfono principal del negocio para clientes' })
  businessPhone?: string;

  @Column({ length: 20, nullable: true, comment: 'Número de WhatsApp principal del negocio' })
  businessWhatsapp?: string;

  @Column({ default: false, comment: 'Si es true, cada sucursal puede tener su propio teléfono.' })
  branchesHaveSeparatePhones: boolean;

  @Column({ default: false, comment: 'Si es true, cada sucursal puede tener su propio WhatsApp.' })
  branchesHaveSeparateWhatsapps: boolean;

  // --- Fin de Nuevos Campos ---

  // --- Branding y Redes Sociales ---

  @Column({ type: 'varchar', length: 512, nullable: true })
  logoUrl?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  logoDarkUrl?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  faviconUrl?: string;

  @Column({ length: 100, nullable: true })
  website?: string;

  @Column({ length: 100, nullable: true })
  facebook?: string;

  @Column({ length: 100, nullable: true })
  instagram?: string;

  @Column({ length: 100, nullable: true })
  tiktok?: string;

  // --- Integraciones y Configuraciones Técnicas ---

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