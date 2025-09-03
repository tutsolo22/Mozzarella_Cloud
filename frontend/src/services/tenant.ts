import apiClient from './apiClient';
import { Tenant } from '../types/tenant';

export const getTenantSettings = async (): Promise<Tenant> => {
  const response = await apiClient.get('/tenants/settings');
  return response.data;
};

export const regenerateWhatsappApiKey = async (): Promise<string> => {
  const response = await apiClient.post('/tenants/regenerate-whatsapp-key');
  return response.data;
};