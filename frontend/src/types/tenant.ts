export enum TenantStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}

export interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
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