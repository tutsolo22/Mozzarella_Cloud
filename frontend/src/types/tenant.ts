export interface TenantConfiguration {
  id: string;
  tenantId: string;
  mercadoPagoAccessToken?: string | null;
  enabledPaymentMethods?: string[];
  openCageApiKey?: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  configuration?: TenantConfiguration;
  createdAt: string;
  updatedAt: string;
}