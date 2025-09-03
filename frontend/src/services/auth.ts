import api from './api';
import { LoginCredentials, User } from '../types/user';

export const login = (credentials: LoginCredentials): Promise<{ access_token: string; user: User }> => {
  return api.post('/auth/login', credentials);
};

export const switchLocation = (locationId: string): Promise<{ access_token: string }> => {
  return api.patch('/auth/switch-location', { locationId });
};