export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  fullName: string;
  phoneNumber: string;
  address?: string;
}

export type UpdateCustomerDto = Partial<CreateCustomerDto>;

