import api from '../api/axiosClient';
import { Location, CreateLocationDto, UpdateLocationDto } from '../types/location';

/**
 * Obtiene las sucursales a las que el usuario autenticado tiene acceso.
 */
export const getLocations = async (includeInactive = false): Promise<Location[]> => {
  // FIX: Se añade await y se devuelve .data para asegurar que siempre se retorne un array.
  // Este era el origen del error de la página en blanco.
  const response = await api.get<Location[]>('/locations', {
    params: { includeInactive },
  });
  return response.data;
};

export const createLocation = async (data: CreateLocationDto): Promise<Location> => {
  const response = await api.post<Location>('/locations', data);
  return response.data;
};

export const updateLocation = async (id: string, data: UpdateLocationDto): Promise<Location> => {
  const response = await api.patch<Location>(`/locations/${id}`, data);
  return response.data;
};

export const disableLocation = async (id: string): Promise<void> => {
  await api.delete(`/locations/${id}`);
};

export const enableLocation = async (id: string): Promise<void> => {
  // FIX: El endpoint correcto es /enable, no /restore.
  await api.patch(`/locations/${id}/enable`);
};