import api from '../api/axiosClient';
import { Tenant } from '../types/tenant';

export const getTenantSettings = async (): Promise<Tenant> => {
  const response = await api.get('/tenants/settings');
  return response.data;
};

export const regenerateWhatsappApiKey = async (): Promise<string> => {
  const response = await api.post('/tenants/regenerate-whatsapp-key');
  return response.data;
};