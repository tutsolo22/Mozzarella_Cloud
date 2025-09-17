export interface PreparationZone {
  id: string;
  name: string;
  locationId: string;
  tenantId: string;
  createdAt: string;
}

export type CreatePreparationZoneDto = Pick<PreparationZone, 'name'>;
export type UpdatePreparationZoneDto = Partial<CreatePreparationZoneDto>;