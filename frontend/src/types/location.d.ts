export interface Location {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  tenantId: string;
  deletedAt?: string | null;
}

export interface CreateLocationDto {
  name: string;
  address: string;
}

export type UpdateLocationDto = Partial<CreateLocationDto>;