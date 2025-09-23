export interface Location {
  id: string;
  name: string;
  address: string;
  phone?: string | null;
  whatsappNumber?: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  
}

export interface CreateLocationDto {
  name: string;
  address: string;
  phone?: string;
  whatsappNumber?: string;
}

export type UpdateLocationDto = Partial<CreateLocationDto> & { isActive?: boolean };

