import { Location } from './location';

export enum UserStatus {
  PendingVerification = 'pending_verification',
  Active = 'active',
  Suspended = 'suspended',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  status: UserStatus;
  role: {
    id: string;
    name: string;
  };
  permissions: string[];
  locationId: string | null;
  location?: Location;
  tenant?: {
    id: string;
    name: string;
  };
}

export interface LoginCredentials {
  email: string;
  password?: string;
  remember?: boolean;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateProfileDto {
  fullName?: string;
}

export interface CreateUserDto {
  email: string;
  password?: string;
  fullName: string;
  roleId: string;
  locationId?: string | null;
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  roleId?: string;
  locationId?: string | null;
}