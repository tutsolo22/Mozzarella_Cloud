export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  isActive: boolean;
  tenantId: string;
  deliveryArea: any | null; // Puedes definir un tipo más específico para GeoJSON si lo necesitas
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateLocationDto {
  name: string;
  address: string;
  phone?: string;
}

export type UpdateLocationDto = Partial<CreateLocationDto>;
