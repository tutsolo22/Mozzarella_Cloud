import api from '../api/axiosClient';
import { Location } from '../types/location';

export interface CreateLocationDto {
  name: string;
  address: string;
  phone?: string;
}

export type UpdateLocationDto = Partial<CreateLocationDto>;

/**
 * Obtiene las sucursales a las que el usuario autenticado tiene acceso.
 */
export const getMyLocations = (): Promise<Location[]> => {
  return api.get('/locations?includeInactive=true');
};

export const createLocation = async (data: CreateLocationDto): Promise<Location> => {
  const response = await api.post('/locations', data);
  return response.data;
};

export const updateLocation = async (id: string, data: UpdateLocationDto): Promise<Location> => {
  const response = await api.patch(`/locations/${id}`, data);
  return response.data;
};

export const disableLocation = async (id: string): Promise<void> => {
  await api.delete(`/locations/${id}`);
};

export const enableLocation = async (id: string): Promise<void> => {
  await api.patch(`/locations/${id}/restore`);
};