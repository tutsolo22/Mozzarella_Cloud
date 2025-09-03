import { Location } from './location';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: {
    id?: string; // Made optional to accommodate JWT payload
    name: string;
  };
  roleId?: string; // Made optional to accommodate JWT payload
  location?: Location;
  locationId?: string | null;
  permissions?: string[];
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export type CreateUserDto = Omit<User, 'id' | 'role' | 'location'> & { password?: string };
export type UpdateUserDto = Partial<CreateUserDto>;