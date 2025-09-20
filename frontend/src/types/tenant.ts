import { License } from './license';
import { User } from './user';

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
  openRouteServiceApiKey?: string | null;
  kdsNotificationSoundUrl?: string | null;
}