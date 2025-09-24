import { License } from './license';
import { User } from './user';

export enum PaymentMethod {
  Cash = 'cash',
  Card = 'card',
  MercadoPago = 'mercado_pago',
}

export enum TenantStatus {
  Active = 'active',
  Trial = 'trial',
  Inactive = 'inactive',
  Suspended = 'suspended',
}

export interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
  whatsappApiKey?: string;
  license: License | null;
  users?: User[];
}

export interface CreateTenantDto {
  name: string;
  adminEmail: string;
  adminFullName: string;
}

export type UpdateTenantDto = Partial<Pick<Tenant, 'name'>>;

export interface TenantConfiguration {
  id: string;
  tenantId: string;
  deliveryArea: any; // GeoJSON Polygon
  kdsNotificationSoundUrl?: string | null;

  // Información General y Fiscal
  businessName?: string; // Razón Social
  legalName?: string;
  rfc?: string;
  taxRegime?: string; // Régimen Fiscal
  taxAddress?: string;

  // Información de Contacto
  contactEmail: string;
  contactPhone?: string;
  businessPhone?: string;
  businessWhatsapp?: string;
  branchesHaveSeparatePhones: boolean;
  branchesHaveSeparateWhatsapps: boolean;

  // Branding y Redes Sociales
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  primaryPrinterIp?: string;
  secondaryPrinterIp?: string;

  // Nuevos campos para Integración de Facturación
  invoicingAppUrl?: string;
  whatsappApiKey?: string;
  isHexaFactIntegrationEnabled?: boolean;

  // Integraciones de pago
  mercadoPagoAccessToken?: string;
  enabledPaymentMethods?: PaymentMethod[];
  tenant?: Tenant;
}