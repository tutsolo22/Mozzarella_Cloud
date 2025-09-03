import api from './api';
import { Location } from '../types/location';

/**
 * Obtiene las sucursales a las que el usuario autenticado tiene acceso.
 */
export const getMyLocations = (): Promise<Location[]> => {
  return api.get('/locations');
};