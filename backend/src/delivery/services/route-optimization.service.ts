import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

interface Point {
  lat: number;
  lng: number;
}

@Injectable()
export class RouteOptimizationService {
  private readonly logger = new Logger(RouteOptimizationService.name);

  constructor(private readonly httpService: HttpService) {}

  // Haversine formula para calcular distancia en línea recta (simple y sin dependencias)
  private getDistance(p1: Point, p2: Point): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
    const dLon = (p2.lng - p1.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(p1.lat * (Math.PI / 180)) *
        Math.cos(p2.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  }

  private async getTravelTimeMatrix(points: Point[], apiKey: string): Promise<number[][] | null> {
    if (points.length < 2) return null;
    const url = 'https://api.openrouteservice.org/v2/matrix/driving-car';
    const coordinates = points.map(p => [p.lng, p.lat]);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          { locations: coordinates, metrics: ['duration'] },
          { headers: { Authorization: apiKey } },
        ),
      );
      // La API devuelve la duración en segundos
      return response.data.durations;
    } catch (error) {
      this.logger.error('Error al obtener matriz de tiempos de OpenRouteService', error.response?.data);
      return null;
    }
  }

  /**
   * Algoritmo Greedy para sugerir rutas basado en tiempo de viaje o distancia.
   */
  async optimizeRoutes(
    orders: Order[],
    drivers: User[],
    constraints: { maxOrdersPerDriver: number },
    restaurantLocation: Point,
    directionsApiKey?: string,
  ) {
    if (directionsApiKey) {
      this.logger.log('Optimizando rutas con tiempo de viaje real (API de Direcciones).');
      return this.optimizeRoutesByTravelTime(orders, drivers, constraints, restaurantLocation, directionsApiKey);
    } else {
      this.logger.warn('Optimizando rutas con distancia en línea recta (API de Direcciones no configurada).');
      return this.optimizeRoutesByDistance(orders, drivers, constraints, restaurantLocation);
    }
  }

  private async optimizeRoutesByTravelTime(
    orders: Order[],
    drivers: User[],
    constraints: { maxOrdersPerDriver: number },
    restaurantLocation: Point,
    apiKey: string,
  ) {
    const priorityOrders = orders.filter(o => o.latitude && o.longitude && o.isPriority);
    const regularOrders = orders.filter(o => o.latitude && o.longitude && !o.isPriority);

    const routes: {
      driver: User;
      orders: Order[];
      totalDuration: number;
      currentWeight: number;
      currentVolume: number;
    }[] = drivers.map(driver => ({
      driver,
      orders: [],
      totalDuration: 0,
      currentWeight: 0,
      currentVolume: 0,
    }));

    for (const route of routes) {
      let lastLocationPoint: Point = restaurantLocation;

      while (route.orders.length < constraints.maxOrdersPerDriver && (priorityOrders.length > 0 || regularOrders.length > 0)) {
        const ordersToSearch = priorityOrders.length > 0 ? priorityOrders : regularOrders;

        const pointsForMatrix = [lastLocationPoint, ...ordersToSearch.map(o => ({ lat: o.latitude!, lng: o.longitude! }))];
        const timeMatrix = await this.getTravelTimeMatrix(pointsForMatrix, apiKey);

        if (!timeMatrix) break; // Falló la API, no se puede continuar

        const durationsFromLast = timeMatrix[0];
        let bestDuration = Infinity;
        let bestOrderIndex = -1;

        for (let i = 0; i < ordersToSearch.length; i++) {
          const duration = durationsFromLast[i + 1]; // +1 porque el índice 0 es la propia ubicación de origen
          if (duration < bestDuration) {
            bestDuration = duration;
            bestOrderIndex = i;
          }
        }

        if (bestOrderIndex !== -1) {
          const closestOrder = ordersToSearch[bestOrderIndex];
          if (this.checkCapacity(route, closestOrder)) {
            route.orders.push(closestOrder);
            route.totalDuration += bestDuration;
            route.currentWeight += Number(closestOrder.totalWeightKg) || 0;
            route.currentVolume += Number(closestOrder.totalVolumeM3) || 0;
            lastLocationPoint = { lat: closestOrder.latitude!, lng: closestOrder.longitude! };
            
            // Eliminar el pedido de la lista correcta
            if (closestOrder.isPriority) {
              priorityOrders.splice(priorityOrders.findIndex(o => o.id === closestOrder.id), 1);
            } else {
              regularOrders.splice(regularOrders.findIndex(o => o.id === closestOrder.id), 1);
            }
          } else {
            // El pedido más cercano no cabe, se elimina de las opciones y se vuelve a intentar
            ordersToSearch.splice(bestOrderIndex, 1);
            continue;
          }
        } else {
          break;
        }
      }
    }

    return this.formatRoutes(routes, true);
  }

  private optimizeRoutesByDistance(
    orders: Order[],
    drivers: User[],
    constraints: { maxOrdersPerDriver: number },
    restaurantLocation: Point,
  ) {
    const priorityOrders = orders.filter(o => o.latitude && o.longitude && o.isPriority);
    const regularOrders = orders.filter(o => o.latitude && o.longitude && !o.isPriority);

    const routes: any[] = drivers.map(driver => ({
      driver, orders: [], totalDistance: 0, currentWeight: 0, currentVolume: 0,
    }));

    for (const route of routes) {
      let lastLocation = restaurantLocation;
      while (route.orders.length < constraints.maxOrdersPerDriver && (priorityOrders.length > 0 || regularOrders.length > 0)) {
        const ordersToSearch = priorityOrders.length > 0 ? priorityOrders : regularOrders;

        let closestOrderIndex = -1;
        let bestDistance = Infinity;

        ordersToSearch.forEach((order, index) => {
          const distance = this.getDistance(lastLocation, { lat: order.latitude!, lng: order.longitude! });
          if (distance < bestDistance) {
            bestDistance = distance;
            closestOrderIndex = index;
          }
        });

        if (closestOrderIndex !== -1) {
          const closestOrder = ordersToSearch[closestOrderIndex];
          if (this.checkCapacity(route, closestOrder)) {
            route.orders.push(closestOrder);
            route.totalDistance += bestDistance;
            route.currentWeight += Number(closestOrder.totalWeightKg) || 0;
            route.currentVolume += Number(closestOrder.totalVolumeM3) || 0;
            lastLocation = { lat: closestOrder.latitude!, lng: closestOrder.longitude! };
            if (closestOrder.isPriority) {
              priorityOrders.splice(priorityOrders.findIndex(o => o.id === closestOrder.id), 1);
            } else {
              regularOrders.splice(regularOrders.findIndex(o => o.id === closestOrder.id), 1);
            }
          } else {
            ordersToSearch.splice(closestOrderIndex, 1);
            continue;
          }
        } else {
          break;
        }
      }
    }
    return this.formatRoutes(routes, false);
  }

  private checkCapacity(route: { currentWeight: number, currentVolume: number, driver: User }, order: Order): boolean {
    const orderWeight = Number(order.totalWeightKg) || 0;
    const orderVolume = Number(order.totalVolumeM3) || 0;
    const driverMaxWeight = Number(route.driver.maxWeightCapacityKg) || Infinity;
    const driverMaxVolume = Number(route.driver.maxVolumeCapacityM3) || Infinity;
    return route.currentWeight + orderWeight <= driverMaxWeight && route.currentVolume + orderVolume <= driverMaxVolume;
  }

  private formatRoutes(routes: any[], isTimeBased: boolean) {
    return routes
      .filter(r => r.orders.length > 0)
      .map(r => ({
        driverId: r.driver.id,
        driverName: r.driver.fullName,
        orders: r.orders.map((o: Order) => ({
          id: o.id,
          shortId: o.shortId,
          deliveryAddress: o.deliveryAddress,
          isPriority: o.isPriority,
          weight: Number(o.totalWeightKg),
          volume: Number(o.totalVolumeM3),
          latitude: o.latitude,
          longitude: o.longitude,
        })),
        orderCount: r.orders.length,
        estimatedDistanceKm: !isTimeBased ? r.totalDistance.toFixed(2) : undefined,
        estimatedDurationMinutes: isTimeBased ? Math.round(r.totalDuration / 60) : Math.round(r.totalDistance * 5), // 5 min/km fallback
        currentWeightKg: r.currentWeight.toFixed(3),
        maxWeightKg: r.driver.maxWeightCapacityKg,
        currentVolumeM3: r.currentVolume.toFixed(6),
        maxVolumeM3: r.driver.maxVolumeCapacityM3,
      }));
  }
}