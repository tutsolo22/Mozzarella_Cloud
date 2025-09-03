import { InventoryMovementType } from './enums';

export interface InventoryMovement {
  id: string;
  createdAt: string;
  type: InventoryMovementType;
  quantityChange: number;
  reason: string;
  user?: {
    id: string;
    fullName: string;
  };
  order?: {
    id: string;
    shortId: string;
  };
}