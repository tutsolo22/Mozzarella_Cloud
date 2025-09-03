export interface OptimizedRouteOrder {
  id: string;
  shortId: string;
  deliveryAddress?: string;
  latitude?: number;
  longitude?: number;
  isPriority?: boolean;
  weight: number;
  volume: number;
}

export interface OptimizedRoute {
  driverId: string;
  driverName: string;
  orders: OptimizedRouteOrder[];
  orderCount: number;
  estimatedDistanceKm?: string;
  estimatedDurationMinutes?: number;
  currentWeightKg: string;
  maxWeightKg?: number;
  currentVolumeM3: string;
  maxVolumeM3?: number;
}