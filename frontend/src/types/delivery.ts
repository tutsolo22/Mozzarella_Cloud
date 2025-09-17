import { Order } from './order';
import { User } from './user';

export interface OptimizedRoute {
  driver: User;
  orders: Order[];
  totalDistance: number; // in meters
  totalDuration: number; // in seconds
  routeGeometry?: any; // GeoJSON LineString or similar
}